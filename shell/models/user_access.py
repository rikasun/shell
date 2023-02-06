from shell.cloudyblobject import (
    IDIndexedCloudyBlobject,
)


class UserAccess(IDIndexedCloudyBlobject):
    primary_key = "email"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
