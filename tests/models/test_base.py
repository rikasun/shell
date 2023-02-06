from unittest import TestCase
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.schema import DropTable
from sqlalchemy.ext.compiler import compiles

from shell.models import Base

Session = sessionmaker()
# Turn on echo=True for logging
engine = create_engine(
    "postgresql://cased:shell@127.0.0.1:5536/cased-shell-test", echo=False, future=True
)
engine = engine.execution_options(isolation_level="AUTOCOMMIT")

# Added to resolve failure
# E       sqlalchemy.exc.InternalError: (psycopg2.errors.DependentObjectsStillExist) cannot drop table program because other objects depend on it
# E       DETAIL:  constraint log_entry_program_id_fkey on table log_entry depends on table program
# E       HINT:  Use DROP ... CASCADE to drop the dependent objects too.
# E
@compiles(DropTable, "postgresql")
def _compile_drop_table(element, compiler, **kwargs):
    return compiler.visit_drop_table(element) + " CASCADE"


class TestBase(TestCase):
    def setUp(self):
        Base.metadata.create_all(engine)
        self.connection = engine.connect()

        self.session = Session(bind=self.connection)
        Base.set_session(self.session)

    def tearDown(self):
        Base.metadata.drop_all(engine)
        self.session.close()
        self.connection.close()
        Base.set_session(None)
