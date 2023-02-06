import datetime
import ipaddress
import json
import os
import re
import time
from typing import Iterable

import jwt
from tornado.util import unicode_type

try:
    from types import UnicodeType
except ImportError:
    UnicodeType = str

try:
    from urllib.parse import urlparse
except ImportError:
    from urlparse import urlparse

numeric = re.compile(r"[0-9]+$")
allowed = re.compile(r"(?!-)[a-z0-9-]{1,63}(?<!-)$", re.IGNORECASE)


def to_str(bstr, encoding="utf-8"):
    if isinstance(bstr, bytes):
        return bstr.decode(encoding)
    return bstr


def to_bytes(ustr, encoding="utf-8"):
    if isinstance(ustr, UnicodeType):
        return ustr.encode(encoding)
    return ustr


def to_int(string):
    try:
        return int(string)
    except (TypeError, ValueError):
        pass


def to_sentence(listed, operator="and"):
    if len(listed) == 0:
        return ""
    if len(listed) == 1:
        return listed[0]
    if len(listed) == 2:
        return listed[0] + " + operator + " + listed[1]
    return ", ".join(listed[:-1]) + ", and " + listed[-1]


def to_slug(slug):
    slug = re.sub(r"[^a-z0-9]+", "-", slug.lower()).strip("-")
    slug = re.sub(r"[-]+", "-", slug)
    return slug


def to_ip_address(ipstr):
    ip = to_str(ipstr)
    if ip.startswith("fe80::"):
        ip = ip.split("%")[0]
    return ipaddress.ip_address(ip)


def is_valid_ip_address(ipstr):
    try:
        to_ip_address(ipstr)
    except ValueError:
        return False
    return True


def is_valid_port(port):
    return 0 < port < 65536


def is_valid_encoding(encoding):
    try:
        "test".encode(encoding)
    except LookupError:
        return False
    return True


def is_ip_hostname(hostname):
    it = iter(hostname)
    if next(it) == "[":
        return True
    for ch in it:
        if ch != "." and not ch.isdigit():
            return False
    return True


def is_valid_hostname(hostname):
    if hostname[-1] == ".":
        # strip exactly one dot from the right, if present
        hostname = hostname[:-1]
    if len(hostname) > 253:
        return False

    labels = hostname.split(".")

    # the TLD must be not all-numeric
    if numeric.match(labels[-1]):
        return False

    return all(allowed.match(label) for label in labels)


def is_same_primary_domain(domain1, domain2):
    i = -1
    dots = 0
    l1 = len(domain1)
    l2 = len(domain2)
    m = min(l1, l2)

    while i >= -m:
        c1 = domain1[i]
        c2 = domain2[i]

        if c1 == c2:
            if c1 == ".":
                dots += 1
                if dots == 2:
                    return True
        else:
            return False

        i -= 1

    if l1 == l2:
        return True

    if dots == 0:
        return False

    c = domain1[i] if l1 > m else domain2[i]
    return c == "."


def parse_origin_from_url(url):
    url = url.strip()
    if not url:
        return

    if not (
        url.startswith("http://") or url.startswith("https://") or url.startswith("//")
    ):
        url = "//" + url

    parsed = urlparse(url)
    port = parsed.port
    scheme = parsed.scheme

    if scheme == "":
        scheme = "https" if port == 443 else "http"

    if port == 443 and scheme == "https":
        netloc = parsed.netloc.replace(":443", "")
    elif port == 80 and scheme == "http":
        netloc = parsed.netloc.replace(":80", "")
    else:
        netloc = parsed.netloc

    return "{}://{}".format(scheme, netloc)


def cased_shell_url():
    if os.getenv("CASED_LOCAL", False) and os.getenv("CODESPACE_NAME", "") == "":
        return "http://localhost:8888"
    else:
        hostname = os.getenv("CASED_SHELL_HOSTNAME", "")
        return "https://{}".format(hostname)


def cased_frontend_url():
    codespace_name = os.getenv("CODESPACE_NAME", "")
    github_codespaces_port_forwarding_domain = os.getenv(
        "GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN", ""
    )
    if codespace_name == "" or github_codespaces_port_forwarding_domain == "":
        return "http://localhost:4200"

    return "https://{}-4200.{}".format(
        codespace_name, github_codespaces_port_forwarding_domain
    )


def get_shell_host_file():
    return os.getenv("CASED_SHELL_HOST_FILE", None)


def is_privkey_stored():
    key = get_stored_private_key()
    if key:
        return True
    else:
        return False


def get_stored_private_key():
    return os.getenv("CASED_SHELL_SSH_PRIVATE_KEY", None)


def get_ssh_username():
    return os.getenv("CASED_SHELL_SSH_USERNAME", None)


def get_ssh_passphrase():
    return os.getenv("CASED_SHELL_SSH_PASSPHRASE", None)


def cased_shell_share_url():
    if os.getenv("CASED_LOCAL", None) and os.getenv("CODESPACE_NAME", "") == "":
        return "ws://localhost:8888"
    else:
        hostname = os.getenv("CASED_SHELL_HOSTNAME", "")
        return "wss://{}".format(hostname)


def generate_jwt(data={}, secret=None):
    if not secret:
        secret = os.getenv("JWT_SIGNING_KEY", "insecure")
    encoded = jwt.encode(data, secret, algorithm="HS256")
    return encoded


def human_time_duration(seconds):
    TIME_UNITS = (
        ("week", 60 * 60 * 24 * 7),
        ("day", 60 * 60 * 24),
        ("hour", 60 * 60),
        ("minute", 60),
        ("second", 1),
    )

    if seconds == 0:
        return "inf"
    parts = []
    for unit, div in TIME_UNITS:
        amount, seconds = divmod(int(seconds), div)
        if amount > 0:
            parts.append("{} {}{}".format(amount, unit, "" if amount == 1 else "s"))
    return ", ".join(parts)


def human_time_duration_v2(start_time, end_time):
    seconds = 0
    if not start_time:
        seconds = 0
    if not end_time:
        # session is ongoing, report its current duration
        current = int(time.time())
    else:
        current = int(datetime.datetime.timestamp(end_time))

    seconds = current - int(datetime.datetime.timestamp(start_time))
    return human_time_duration(seconds)


def get_cased_shell_settings_url():
    return "{}/settings".format(cased_shell_url())


def get_settings_subnavs():
    subnavs = [
        ("/settings", "General"),
        ("/settings/ssh", "SSH"),
        ("/settings/user-access", "Users"),
        ("/settings/group-access", "Groups"),
    ]

    return subnavs


def get_v2_settings_subnavs():
    subnavs = [
        ("/v2/settings", "General"),
        ("/v2/settings/ssh", "SSH"),
        ("/v2/settings/users-and-groups", "Users and Groups"),
        ("/v2/settings/approvals", "Approvals"),
        ("/v2/settings/runbooks", "Runbooks"),
        ("/v2/settings/profile", "User Profile"),
    ]

    return subnavs


def check_labels_match(assigned_labels, prompt_labels):
    for assigned_label_key, assigned_label_value in assigned_labels.items():
        if assigned_label_key in prompt_labels:
            value_to_match = prompt_labels.get(assigned_label_key)
            if assigned_label_value == "*":
                return True
            elif (
                type(assigned_label_value) == str
                and assigned_label_value.lower() == value_to_match.lower()
            ):
                return True
            elif type(assigned_label_value) == list and value_to_match.lower() in [
                v.lower() for v in assigned_label_value
            ]:
                return True
            else:
                continue

    return False


def to_json(data, nested=False):
    if not data:
        # Returns None if data is None
        # We serialize data if it is just an empty list <class 'list'>, eg: when Group.all() returns []
        # We don't serialize data when it belongs to <class 'sqlalchemy.ext.associationproxy._AssociationList'>, which is not JSON serializable. e.g.  when user.groups returns []
        if isinstance(data, Iterable) and data.__class__.__name__ != "_AssociationList":
            return json.dumps(data)
        return data
    if isinstance(data, Iterable):
        data = [o.to_dict(nested=nested) for o in data]
    else:
        data = data.to_dict(nested=nested)

    # convert unserializable datetime to str
    return json.dumps(data, indent=4, sort_keys=True, default=str)


def flatten_list(l):
    result = []
    if not l or not isinstance(l, Iterable):
        return result
    else:
        for i in l:
            if isinstance(i, Iterable):
                result.extend(flatten_list(i))
            else:
                result.append(i)

    return result


def later_than_now(expired_at):
    if not expired_at:
        return False

    current_time = int(time.time())
    expired_time = int(datetime.datetime.timestamp(expired_at))
    if current_time >= expired_time:
        return True

    return False


def get_current_time():
    return datetime.datetime.now()


def json_decode(data):
    if not data:
        return data
    return json.loads(to_unicode(data))


def to_unicode(value):
    if isinstance(value, unicode_type):
        return value
    if not isinstance(value, bytes):
        raise TypeError("Expected bytes, unicode, or None; got %r" % type(value))
    return value.decode("utf-8")
