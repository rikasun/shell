# pylint: disable=no-member, attribute-defined-outside-init

import unittest
from unittest.mock import MagicMock
from shell.cloudyblobject import (
    CloudyBlobject,
    IDIndexedCloudyBlobject,
    IsolatedCloudyBlobject,
    LocalStorageDriver,
    NameIndexedCloudyBlobject,
)


class ExampleObject(IDIndexedCloudyBlobject):
    pass


class ExampleCustomer(NameIndexedCloudyBlobject):
    blob_name = "example_customers.json"

    def greet(self):
        return "hello {}".format(self.name)


class ExampleCustomer2(NameIndexedCloudyBlobject):
    pass


class TestCloudyBlobject(unittest.TestCase):
    def test_round_trip(self):
        self.assertEqual(ExampleObject.all(), [])
        j = ExampleObject.create(name="Jewel")
        self.assertNotEqual(j.id, j.name)
        self.assertEqual(ExampleObject.find(j.id).name, "Jewel")
        all = ExampleObject.all()
        self.assertEqual(all[0].name, "Jewel")

    def test_round_trip_of_name_indexed_objects(self):
        created_john = ExampleCustomer.create(name="John")
        found_john = ExampleCustomer.find("John")
        self.assertEqual(created_john.greet(), "hello John")
        self.assertEqual(found_john.greet(), "hello John")

    def test_attributes_accessible(self):
        created2 = ExampleCustomer.create(name="Jane")
        self.assertEqual(created2.name, "Jane")

    def test_missing_returns_none(self):
        missing_john = ExampleCustomer2.find("John")
        self.assertIsNone(missing_john)

    def test_update(self):
        ExampleCustomer.create(name="John")
        ExampleCustomer.update("John", nickname="Johnny")
        self.assertEqual(ExampleCustomer.find("John").nickname, "Johnny")

    def test_save(self):
        created = ExampleCustomer.create(name="John")
        created.nickname = "Johnny"
        created.save()
        self.assertEqual(ExampleCustomer.find("John").nickname, "Johnny")

    def test_case_insensitive_find(self):
        created = ExampleCustomer.create(name="John")
        created.nickname = "Johnny"
        created.save()
        self.assertEqual(ExampleCustomer.find("JOHN"), None)
        self.assertEqual(
            ExampleCustomer.case_insensitive_find("JOHN").nickname, "Johnny"
        )
        self.assertEqual(ExampleCustomer.case_insensitive_find("Jane"), None)

    def test_initialize(self):
        a = ExampleObject(test_attribute="test")
        a.save()
        self.assertEqual(ExampleObject.find(a.id).test_attribute, "test")

    def test_read_cache(self):
        class DupeLocalStorageDriver(LocalStorageDriver):
            pass

        class CachedCustomer(IDIndexedCloudyBlobject):
            _storage_driver = DupeLocalStorageDriver()

        a = CachedCustomer(test_attribute="test").save()
        CachedCustomer._storage_driver.read = MagicMock(
            return_value={a.id: {"id": a.id, "test_attribute": "test"}}
        )
        b = CachedCustomer.find(a.id)
        c = CachedCustomer.find(a.id)
        CachedCustomer._storage_driver.read.assert_not_called()

    def test_read_cache_disabled(self):
        class DupeLocalStorageDriver(LocalStorageDriver):
            pass

        class CachedCustomer(IDIndexedCloudyBlobject):
            _storage_driver = DupeLocalStorageDriver()

        IDIndexedCloudyBlobject.caching = False

        a = CachedCustomer(test_attribute="test").save()
        CachedCustomer._storage_driver.read = MagicMock(
            return_value={a.id: {"id": a.id, "test_attribute": "test"}}
        )
        b = CachedCustomer.find(a.id)
        c = CachedCustomer.find(a.id)
        CachedCustomer._storage_driver.read.assert_called()

    def test_read_cache_can_be_cleared(self):
        class DupeLocalStorageDriver(LocalStorageDriver):
            pass

        class CachedCustomer(IDIndexedCloudyBlobject):
            _storage_driver = DupeLocalStorageDriver()

        a = CachedCustomer(test_attribute="test").save()
        CachedCustomer._storage_driver.read = MagicMock(
            return_value={a.id: {"id": a.id, "test_attribute": "test"}}
        )
        b = CachedCustomer.find(a.id)
        CachedCustomer._storage_driver.read.assert_not_called()
        IDIndexedCloudyBlobject.clear_cache()
        c = CachedCustomer.find(a.id)
        CachedCustomer._storage_driver.read.assert_called()

    def tearDown(self):
        CloudyBlobject._storage_driver.delete_all()
        ExampleObject.cache = None
        ExampleCustomer.cache = None
        ExampleCustomer2.cache = None
        super().tearDown()


class ExampleIsolatedObject(IsolatedCloudyBlobject):
    pass


class TestIsolatedCloudyBlobject(unittest.TestCase):
    def test_round_trip(self):
        j = ExampleIsolatedObject.create(data=b"Jewel")
        id = j.id
        self.assertNotEqual(id, j.data)
        self.assertEqual(ExampleIsolatedObject.find(j.id).data, b"Jewel")
        j.delete()
        missing = ExampleIsolatedObject.find(id)
        self.assertIsNone(missing)

    def test_create_find_and_save(self):
        created = ExampleIsolatedObject.create(data=b"John")
        created.data = b"Johnny"
        created.save()
        found = ExampleIsolatedObject.find(created.id)
        self.assertEqual(found.data, b"Johnny")
        found.data = b"Johnny Smith"
        found.save()
        self.assertEqual(ExampleIsolatedObject.find(created.id).data, b"Johnny Smith")

    def test_with_existing_id(self):
        a = ExampleIsolatedObject(id="test", data=b"test")
        a.save()
        self.assertEqual(ExampleIsolatedObject.find("test").data, b"test")

    def tearDown(self):
        CloudyBlobject._storage_driver.delete_all()
        super().tearDown()
