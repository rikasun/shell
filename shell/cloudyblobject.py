"""A tiny ORM backed by JSON documents stored on the filesystem or in Cloud Storage.
"""

import os
import json
import uuid
import shutil
import logging
import boto3
from botocore.client import Config
from google.cloud import storage
import google.api_core.exceptions


class StorageDriverInterface:
    """Storage drivers are expected to implement `read` and `write` instance methods and a `delete_all()` class method to be used in test scenarios."""

    @classmethod
    def delete_all(cls):
        raise NotImplementedError

    def read(self, key, encoder=json):
        raise NotImplementedError

    def write(self, key, value, encoder=json):
        raise NotImplementedError


class PGDriver(StorageDriverInterface):
    pass


class LocalStorageDriver(StorageDriverInterface):
    """The default storage driver. Stores JSON documents in $STORAGE_DIR, which defaults to `./.storage`.

    Use this storage driver if you'd prefer to store state on a persistent filesystem.
    """

    @classmethod
    def path(cls):
        path = os.getenv("STORAGE_DIR", os.path.join(os.getcwd(), ".storage"))
        if not os.path.exists(path):
            os.makedirs(path)
        return path

    @classmethod
    def delete_all(cls):
        shutil.rmtree(cls.path())

    def delete(self, filename):
        os.remove(os.path.join(self.__class__.path(), filename))

    def read(self, filename, encoder=json):
        try:
            if encoder is None:
                with open(os.path.join(self.__class__.path(), filename), "rb") as f:
                    return f.read()
            else:
                with open(os.path.join(self.__class__.path(), filename), "r") as f:
                    return encoder.load(f)
        except FileNotFoundError:
            return None

    def write(self, filename, data, encoder=json):
        if encoder is None:
            with open(os.path.join(self.__class__.path(), filename), "wb") as f:
                f.write(data)
        else:
            with open(os.path.join(self.__class__.path(), filename), "w") as f:
                encoder.dump(data, f)
        return data


class S3StorageDriver(StorageDriverInterface):
    """Stores JSON documents in $STORAGE_S3_BUCKET.

    S3 connection information is expected to present in the following environment variables:

    * STORAGE_S3_ACCESS_KEY_ID
    * STORAGE_S3_SECRET_ACCESS_KEY
    * STORAGE_S3_ENDPOINT
    * STORAGE_S3_REGION
    * STORAGE_S3_SIGNATURE_VERSION
    """

    def __init__(self):
        self.bucket = os.getenv("STORAGE_S3_BUCKET")
        if not self.bucket:
            raise Exception("STORAGE_S3_BUCKET is required")

        s3_config = dict(
            aws_access_key_id=os.getenv("STORAGE_S3_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("STORAGE_S3_SECRET_ACCESS_KEY"),
        )

        endpoint = os.getenv("STORAGE_S3_ENDPOINT")
        if endpoint:
            s3_config["endpoint_url"] = endpoint

        signature_version = os.getenv("STORAGE_S3_SIGNATURE_VERSION")
        if signature_version:
            s3_config["config"] = Config(signature_version=signature_version)

        region = os.getenv("STORAGE_S3_REGION")
        if region:
            s3_config["region_name"] = region

        self.s3 = boto3.resource("s3", **s3_config)

    def read(self, filename, encoder=json):
        try:
            if encoder is None:
                return self.s3.Object(self.bucket, filename).get()["Body"].read()
            else:
                return encoder.load(self.s3.Object(self.bucket, filename).get()["Body"])
        except:
            return None

    def write(self, filename, data, encoder=json):
        if encoder is None:
            self.s3.Object(self.bucket, filename).put(Body=data)
        else:
            self.s3.Object(self.bucket, filename).put(
                Body=encoder.dumps(data).encode("UTF-8")
            )
        return data

    def delete(self, filename):
        self.s3.Object(self.bucket, filename).delete()

    def delete_all(self):
        for obj in self.s3.Bucket(self.bucket).objects.all():
            obj.delete()


class GoogleCloudStorageDriver(StorageDriverInterface):
    """Stores JSON documents in $STORAGE_GOOGLE_CLOUD_BUCKET.
    Expects that permissions are granted explicitly by the storage environment.

    Test locally with:

    STORAGE_BACKEND=gcs STORAGE_GOOGLE_CLOUD_BUCKET=test STORAGE_EMULATOR_HOST=http://gcs:8080 pytest --log-cli-level debug -v tests/test_cloudyblobject.py tests/test_shell_session.py tests/models/test_session_replay.py
    """

    def __init__(self):
        self.bucket_name = os.getenv("STORAGE_GOOGLE_CLOUD_BUCKET")
        if not self.bucket_name:
            raise Exception("STORAGE_GOOGLE_CLOUD_BUCKET is required")

        self.gcs = storage.Client()
        self.bucket = self.gcs.get_bucket(self.bucket_name)

    def read(self, filename, encoder=json):
        blob = self.bucket.blob(filename)
        try:
            with blob.open("rb") as data:
                if encoder is None:
                    return data.read()
                else:
                    return encoder.load(data)
        except google.api_core.exceptions.NotFound:
            return None
        except Exception as e:
            logging.exception("error reading %s: %s", filename, e)
            return None

    def write(self, filename, data, encoder=json):
        blob = self.bucket.blob(filename)
        with blob.open("wb") as f:
            if encoder is None:
                f.write(data)
            else:
                f.write(encoder.dumps(data).encode("UTF-8"))
        return data

    def delete(self, filename):
        self.bucket.delete_blob(filename)

    def delete_all(self):
        for blob in self.gcs.list_blobs(self.bucket_name):
            blob.delete()


class CloudyBlobject:
    """A class with a `_storage_driver` instance variable that can be used to read and write data.

    Use the STORAGE_BACKEND environment variable to choose the storage backend.
    Valid values are `local` (the default) and `s3`.
    """

    if os.getenv("STORAGE_BACKEND", "local") == "local":
        _storage_driver = LocalStorageDriver()
    elif os.getenv("STORAGE_BACKEND") == "s3":
        _storage_driver = S3StorageDriver()
    elif os.getenv("STORAGE_BACKEND") == "gcs":
        _storage_driver = GoogleCloudStorageDriver()


class IDIndexedCloudyBlobject(CloudyBlobject):
    """A CloudyBlobject that uses a JSON document to store a list of documents indexed by a primary key (`id` by default).

    The behavior of IDIndexedCloudyBlobject subclasses can be influenced by setting the following class variables:

    * primary_key: the name of the primary key field. defaults to `id`
    * blob_name: the name of the JSON document to store the list of documents in. defaults to `<class name>.json`
    * storage_driver: the storage driver to use. defaults to `LocalStorageDriver`
    * caching: should the cache be used? defaults to True
    * cache: contains a cache of the last retrieved list of documents. set to None to clear the cache.

    Example:

        class Customer(IDIndexedCloudyBlobject):
            pass

        customer1 = Customer(name="John Doe").save()
        john = Customer.find(customer1.id)
        john.nickname = "Johnny"
        john.save()
    """

    caching = True
    cache = None

    def __init__(self, **kwargs):
        """Create a new instance of an object and prepare it for storage.

        All provided kwargs are prepped for persistence. If a value for the class's primary key is not provided, a UUID4 is generated.
        """
        if isinstance(kwargs, dict):
            self.__dict__.update(kwargs)

        if self.__dict__.get(self.__class__._primary_key()) is None:
            update = {}
            update[self.__class__._primary_key()] = uuid.uuid4().__str__()
            self.__dict__.update(dict(update))

    @classmethod
    def _blob_name(cls):
        return getattr(cls, "blob_name", "{}.json".format(cls.__name__))

    @classmethod
    def _primary_key(cls):
        return getattr(cls, "primary_key", "id")

    @classmethod
    def clear_cache(cls):
        if cls.__name__ == "IDIndexedCloudyBlobject":
            [subclass.clear_cache() for subclass in cls.__subclasses__()]
        else:
            logging.debug("clearing cache for %s", cls.__name__)
            cls.cache = None

    @classmethod
    def _read(cls):
        if cls.caching:
            if cls.cache is None:
                cls.cache = cls._storage_driver.read(cls._blob_name()) or {}
            return cls.cache
        else:
            return cls._storage_driver.read(cls._blob_name()) or {}

    @classmethod
    def _write(cls, data):
        written = cls._storage_driver.write(cls._blob_name(), data)
        if cls.caching:
            cls.cache = written
        return written

    @classmethod
    def find(cls, id):
        """Find an object by its primary key. Returns an instance of cls or None."""
        data = cls._read()
        found = data.get(id)
        if found is not None:
            return cls(**found)

    @classmethod
    def case_insensitive_find(cls, id):
        """Find an object by its case insensitive primary key. Returns an instance of cls or None."""
        case_sensitive_ids = list(
            map(lambda access: access.__getattribute__(cls._primary_key()), cls.list())
        )
        try:
            idx = next(
                # Some objects may not have a lower() method, so we need to check for that
                i
                for i, v in enumerate(case_sensitive_ids)
                if hasattr(v, "lower")
                and hasattr(id, "lower")
                and v.lower() == id.lower()
            )
        except StopIteration:
            return None
        case_sensitive_id = case_sensitive_ids[idx]

        data = cls._read()
        found = data.get(case_sensitive_id)
        if found is not None:
            return cls(**found)

    @classmethod
    def create(cls, **kwargs):
        """Create and persist an object represented by kwargs. Returns the persisted object."""
        return cls(**kwargs).save()

    @classmethod
    def update(cls, __id__, **kwargs):
        """Update or create a record with a primary_key of __id__. Returns the persisted object."""
        data = cls._read()
        data[__id__] = kwargs
        cls._write(data)
        return cls.find(id)

    @classmethod
    def all(cls):
        """Returns a list of all objects."""
        data = cls._read()
        return [cls(**data.get(key)) for key, _value in data.items()]

    list = all

    @classmethod
    def delete(cls, id):
        """Delete an object by its primary key."""
        data = cls._read()
        res = data.pop(id, None)
        cls._write(data)
        return res

    def save(self):
        """Persist the object."""
        self.__class__.update(
            self.__dict__.get(self.__class__._primary_key()), **self.__dict__
        )
        return self.__class__.find(self.__dict__.get(self.__class__._primary_key()))

    def __repr__(self):
        return "<{} {}>".format(self.__class__.__name__, self.__dict__)


class NameIndexedCloudyBlobject(IDIndexedCloudyBlobject):
    primary_key = "name"


class IsolatedCloudyBlobject(CloudyBlobject):
    """A CloudyBlobject that stores its data a location identified by a key."""

    def __init__(self, **kwargs):
        """Create a new instance of an object and prepare it for storage.

        All provided kwargs are prepped for persistence. If a value for the class's primary key is not provided, a UUID4 is generated.
        """
        if isinstance(kwargs, dict):
            self.__dict__.update(kwargs)

        if self.__dict__.get(self.__class__._primary_key()) is None:
            update = {}
            update[self.__class__._primary_key()] = uuid.uuid4().__str__()
            self.__dict__.update(dict(update))

    @classmethod
    def _blob_name_for_id(cls, id):
        return "{}-{}".format(cls.__name__, id)

    def _blob_name(self):
        return self.__class__._blob_name_for_id(
            self.__dict__.get(self.__class__._primary_key())
        )

    @classmethod
    def _primary_key(cls):
        return getattr(cls, "primary_key", "id")

    def _read(self):
        return (
            self.__class__._storage_driver.read(self._blob_name(), encoder=None) or None
        )

    def _write(self, data):
        return self.__class__._storage_driver.write(
            self._blob_name(), data, encoder=None
        )

    @classmethod
    def find(cls, id):
        """Find an object by its primary key. Returns an instance of cls or None."""
        args_with_key = dict()
        args_with_key[cls._primary_key()] = id
        instance = cls(**args_with_key)
        data = instance._read()
        if data is not None:
            instance.__dict__.update(data=data)
            return instance

    @classmethod
    def create(cls, **kwargs):
        """Create and persist an object represented by kwargs. Returns the persisted object."""
        return cls(**kwargs).save()

    def delete(self):
        """Delete an object by its primary key."""
        return self.__class__._storage_driver.delete(self._blob_name())

    def save(self):
        """Persist the data."""
        self._write(data=self.__dict__.get("data"))
        return self

    def __repr__(self):
        return "<{} {}>".format(self.__class__.__name__, self.__dict__)
