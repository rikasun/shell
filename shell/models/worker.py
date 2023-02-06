# v2 worker
import logging
import threading
import time
import tornado.websocket

import cased

from tornado.ioloop import IOLoop
from tornado.iostream import _ERRNO_CONNRESET
from tornado.util import errno_from_exception
from shell.models import LogEntry, SessionReplay

from pubsub import pub

RETAIN_TERMINAL_MESSAGE = "retainTerminal"
BUF_SIZE = 32 * 1024
client_lock = threading.Lock()
clients = {}  # {session_id: {id: worker}}


def clear_worker(worker, clients):
    session_id = worker.session_id
    workers = clients.get(session_id)
    assert worker.id in workers
    workers.pop(worker.id)

    if not workers:
        clients.pop(session_id)
        if not clients:
            clients.clear()


def close_worker_unless_authenticated(worker):
    if worker.closed:
        logging.warning("worker {} already closed".format(worker.id))
    else:
        if worker.authentication_completed:
            return
        logging.warning("Closing unauthenticated worker {}".format(worker.id))
        worker.close(reason="authentication timed out")


def recycle_worker(worker):
    if worker.closed:
        logging.warning("worker {} already closed".format(worker.id))
    else:
        if worker.authentication_waiting_for_more_info():
            logging.warning(
                "Waiting for authentication before recycling {}".format(worker.id)
            )
            return
        if worker.handler:
            return
        logging.warning("Recycling worker {}".format(worker.id))
        worker.close(reason="worker recycled")


def retry_if_key_error(exception):
    """Return True if we should retry (in this case when it's an LookupError), False otherwise"""
    return isinstance(exception, LookupError)


def workers_for_session(session_id, ctx=client_lock):
    """Return workers after retrying briefly if LookupError is raised"""
    with ctx:
        if len(clients) == 0 or clients is None:
            raise LookupError("No workers")
        workers = clients.get(session_id)
        if not workers or len(workers) == 0 or workers is None:
            raise LookupError("No workers for session {}".format(session_id))
        return workers


def save_worker_for_session(session_id, worker, ctx=client_lock):
    """Store worker in clients dict"""
    with ctx:
        if clients.get(session_id) is None:
            clients[session_id] = {}
        workers = clients[session_id]
        workers[worker.id] = worker
        clients[session_id] = workers


class Worker(object):
    def __init__(
        self, loop, chan, closers, dst_addr, session_id, close_terminal_on_exit
    ):
        self.chan = chan
        self.fd = chan.fileno() if chan is not None else None
        self.loop = loop
        self.closers = closers
        self.dst_addr = dst_addr
        self.session_id = session_id
        self.id = str(id(self))
        self.data_to_dst = []
        self.handler = None
        self.mode = IOLoop.READ
        self.closed = False
        self.close_terminal_on_exit = close_terminal_on_exit
        self.replay = None
        self.ssh_client = None
        self.encoding = None
        self.authentication_timeout = 30
        self.authentication_completed = False
        self.authentication_exception = None
        self.authentication_waiting_event = threading.Event()
        self.raise_exceptions = True

    def connect_and_try_to_auth(self, args, proxy_jump=None):
        self.raise_exceptions = False
        t = threading.Thread(
            target=self.connect,
            args=(args,),
            kwargs={"proxy_jump": proxy_jump},
            daemon=True,
        )
        t.start()
        while self.authentication_completed is False:
            if self.authentication_exception is not None:
                t.join()
                raise self.authentication_exception
            else:
                if self.authentication_waiting_for_more_info():
                    self.loop.call_later(
                        self.authentication_timeout,
                        close_worker_unless_authenticated,
                        self,
                    )
                    return
                else:
                    logging.info("connect_and_try_to_auth: {}".format(self.ssh_client))
                    time.sleep(0.1)
        t.join()

    def authentication_waiting_for_more_info(self):
        return (
            self.authentication_waiting_event is not None
            and self.authentication_waiting_event.is_set()
        )

    def connect(self, args, proxy_jump=None):
        try:
            _, closers = self.ssh_client.connect_with_jump(
                args,
                proxy_jump=proxy_jump,
                more_info_event=self.authentication_waiting_event,
            )
            for closer in closers:
                self.closers.append(closer)
            self.closers.append(self.ssh_client)
            self.authentication_completed = self.ssh_client.authentication_completed
        except Exception as e:
            self.authentication_exception = e
            if self.raise_exceptions:
                raise e

    def add_chan(self, chan, closers=[]):
        if chan is not None:
            chan.setblocking(0)
            self.chan = chan
            self.fd = chan.fileno()

        if self.closers is None:
            self.closers = []
        for closer in closers:
            self.closers.append(closer)

    def __call__(self, fd, events):
        if events & IOLoop.READ:
            self.on_read()
        if events & IOLoop.WRITE:
            self.on_write()
        if events & IOLoop.ERROR:
            self.close(reason="error event occurred")

    def _log_session_end(self, session_id):
        for log in LogEntry.all():
            if log.metadata_.get("session_id", None) == session_id:
                log.end_session()

        if self.replay:
            logging.debug("Saving session replay {}".format(self.replay.id))
            self.replay.save()

    def set_handler(self, handler):
        if not self.handler:
            self.handler = handler

    def update_handler(self, mode):
        if self.fd is not None:
            if self.mode != mode:
                self.loop.update_handler(self.fd, mode)
                self.mode = mode
            if mode == IOLoop.WRITE:
                self.loop.call_later(0.1, self, self.fd, IOLoop.WRITE)

    def on_read(self):
        logging.debug("worker {} on read".format(self.id))
        if self.chan is None:
            return
        try:
            data = self.chan.recv(BUF_SIZE)
        except (OSError, IOError) as e:
            logging.error(e)
            if self.chan.closed or errno_from_exception(e) in _ERRNO_CONNRESET:
                self.close(reason="chan error on reading")
        else:
            # Publish the bytes to the unique pubsub channel for this session
            topic = "session:{}".format(str(self.session_id))
            pub.sendMessage(topic, msg=data)
            if self.replay:
                self.replay.append(data)

            logging.debug("{!r} from {}:{}".format(data, *self.dst_addr))
            if not data:
                if self.close_terminal_on_exit:
                    self.close(reason="You've logged out of the remote shell")
                else:
                    self.close(reason=RETAIN_TERMINAL_MESSAGE)
                return

            logging.debug("{!r} to {}:{}".format(data, *self.handler.src_addr))
            try:
                self.handler.write_message(data, binary=True)
            except tornado.websocket.WebSocketClosedError:
                self.close(reason="websocket closed")

    def on_write(self):
        logging.debug("worker {} on write".format(self.id))
        if self.chan is None:
            return
        if not self.data_to_dst:
            return

        data = "".join(self.data_to_dst)
        logging.debug("{!r} to {}:{}".format(data, *self.dst_addr))

        try:
            sent = self.chan.send(data)  # number of bytes
        except (OSError, IOError) as e:
            logging.error(e)
            if self.chan.closed or errno_from_exception(e) in _ERRNO_CONNRESET:
                self.close(reason="chan error on writing")
            else:
                self.update_handler(IOLoop.WRITE)
        else:
            self.data_to_dst = []
            data = data[sent:]  # remove the number of elements from bytes sent
            if data:
                self.data_to_dst.append(data)
                self.update_handler(IOLoop.WRITE)
            else:
                self.update_handler(IOLoop.READ)

    def close(self, reason=None):
        if self.closed:
            return
        self.closed = True

        # log the end of the session
        self._log_session_end(self.session_id)

        logging.info("Closing worker {} with reason: {}".format(self.id, reason))
        if self.handler:
            self.loop.remove_handler(self.fd)
            self.handler.close(reason=reason)
        if self.chan is not None:
            self.chan.close()
        for c in reversed(self.closers):
            c.close()
        logging.info("Connection to {}:{} lost".format(*self.dst_addr))

        clear_worker(self, clients)
        logging.debug(clients)

    def enable_recording(self):
        logging.info(
            "Enabling session recording for session {}".format(self.session_id)
        )
        self.replay = SessionReplay.find_or_create(self.session_id)

    def inject_approval_commands(self, shell_name):
        command_1 = """if ! grep -Fq "bash-preexec.sh" ~/.bashrc; then echo '[[ -f ~/.bash-preexec.sh ]] && source ~/.bash-preexec.sh' >> ~/.bashrc;fi;\n"""
        command_2 = "ORIGINAL_PS1=$PS1\n"
        command_3 = """if ! grep -Fq "xe2" ~/.bashrc; then echo "precmd() { PS1=$\'$ORIGINAL_PS1\\xe2\\x80\\x8b\\xe2\\x80\\x8b'; }" >> ~/.bashrc;fi;\n"""
        command_4 = """if grep -Fq "200b" ~/.bashrc | grep -q PS1; then sed -i.bak '/200b/d' ~/.bashrc; fi;\n"""
        command_5 = "source ~/.bashrc\n"
        command_6 = "reset\n"

        print("Using shell: {}".format(shell_name))

        if "zsh" in shell_name:
            command_1.replace("bash", "zsh")
            command_3.replace("bash", "zsh")
            command_4.replace("bash", "zsh")
            command_5.replace("bash", "zsh")

        commands = [
            command_1,
            command_2,
            command_3,
            command_4,
            command_5,
            command_6,
        ]

        for command in commands:
            print(command)
            self.chan.send(command)
