import codecs
from setuptools import setup
from shell._version import __version__ as version


with codecs.open("README.md", encoding="utf-8") as f:
    long_description = f.read()


setup(
    name="shell",
    version=version,
    description="Cased Shell",
    long_description=long_description,
    author="Cased Inc, Shengdun Hua",
    author_email="eng@cased.com",
    url="https://cased.com",
    packages=["shell"],
    entry_points="""
    [console_scripts]
    wssh = shell.main:main
    """,
    license="BSL",
    include_package_data=True,
    classifiers=[
        "Programming Language :: Python",
        "Programming Language :: Python :: 2",
        "Programming Language :: Python :: 2.7",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.4",
        "Programming Language :: Python :: 3.5",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
    ],
    install_requires=[
        "tornado>=4.5.0",
        "pynacl==1.5.0",
        "paramiko==2.10.1",
        "pycased",
        "requests",
        "pypubsub",
        "PyJWT==2.6.0",
        "pyjwt[crypto]==2.6.0",
        "jinja2",
        "boto3==1.18.44",
        "localStoragePy",
        "PyGitHub",
        "protobuf==3.18.3",
        "googleapis-common-protos==1.56.0",
        "google-cloud-storage==2.1.0",
        "google-api-core==2.8.0",
        "sqlalchemy==1.4.36",
        "psycopg2==2.9.3",
        "sqlalchemy_mixins==1.5.3",
        "sqlalchemy-state-machine==1.8.0",
        "geocoder==1.38.1",
        "pycryptodome==3.14.1",
        "hvac==0.11.2",
        "pyyaml==5.4",
        "pkce==1.0.3",
        "camel-converter==3.0.0",
        "passlib==1.7.4",
    ],
)
