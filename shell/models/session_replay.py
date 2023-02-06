import logging
import random
from shell.cloudyblobject import (
    IsolatedCloudyBlobject,
)


class SessionReplay(IsolatedCloudyBlobject):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.data = bytearray()
        data = kwargs.get("data", "")
        if len(data) > 0:
            self.data = bytearray(data)
            self.save()

    @classmethod
    def find_or_create(cls, id):
        """
        Find or create a session replay.
        """
        return cls.find(id) or cls(id=id)

    def to_str(self, encoding="utf-8"):
        """
        Return the string representation of the data.
        """
        return self.data.decode(encoding)

    def append(self, data):
        """
        Append data to the session.
        """
        if len(data) > 0:
            self.data.extend(data)

        if (
            random.uniform(0, 10) > 8
            or self.__class__._storage_driver.__class__.__name__ == "LocalStorageDriver"
        ):
            logging.debug("Saving session replay {}".format(self.id))
            self.save()
        else:
            logging.debug("Deferring session replay save {}".format(self.id))
