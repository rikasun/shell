import os
from sqlalchemy import create_engine

engine = None

_database_url = os.getenv("DATABASE_URL")
if _database_url:
    database_url = _database_url.replace("postgres://", "postgresql://")

    engine = create_engine(database_url, echo=True, future=True)

    engine = engine.execution_options(isolation_level="AUTOCOMMIT")
