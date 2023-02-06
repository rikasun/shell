from threading import Thread
import time
import unittest

from shell.models.worker import save_worker_for_session, workers_for_session, clients


class DelayContextManager(object):
    def __init__(self, delay=0.1):
        self.delay = delay

    def __enter__(self):
        time.sleep(self.delay)

    def __exit__(self, type, value, traceback):
        pass


class FakeWorker(object):
    def __init__(self, id):
        self.id = id


class TestWorker(unittest.TestCase):
    def test_clients_dict_is_racy_without_locking(self):
        clients.clear()

        def set():
            save_worker_for_session(
                "123", FakeWorker("5678"), ctx=DelayContextManager(delay=0.1)
            )

        t1 = Thread(target=set)
        t1.start()
        with self.assertRaises(LookupError) as ctx:
            workers_for_session("123", ctx=DelayContextManager(delay=0))
        t1.join()
        self.assertIn("No workers", str(ctx.exception))

    def test_clients_dict_is_race_free_with_locking(self):
        for i in range(100):
            clients.clear()

            def set():
                save_worker_for_session(str(i), FakeWorker("5678"))

            t1 = Thread(target=set)
            t1.start()
            self.assertEqual(
                workers_for_session(str(i)).get("5678").id,
                "5678",
            )
            t1.join()
