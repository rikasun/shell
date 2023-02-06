from shell.cloudyblobject import (
    IDIndexedCloudyBlobject,
)


class GroupAccess(IDIndexedCloudyBlobject):
    primary_key = "name"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
