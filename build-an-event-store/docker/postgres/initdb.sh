#!/bin/bash

# Modified from:
# https://hub.docker.com/_/postgres/
set -e

echo $POSTGRES_USER
echo $POSTGRES_DB

psql -v ON_ERROR_STOP=1 -v VERBOSITY=verbose --username "$POSTGRES_USER" <<-EOSQL
  CREATE DATABASE build_an_event_store_test;
  \c build_an_event_store

  GRANT ALL PRIVILEGES ON DATABASE build_an_event_store_test TO build_an_event_store;
  ALTER DEFAULT PRIVILEGES FOR ROLE build_an_event_store IN SCHEMA PUBLIC GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO build_an_event_store;
  ALTER DEFAULT PRIVILEGES FOR ROLE build_an_event_store IN SCHEMA PUBLIC GRANT EXECUTE ON FUNCTIONS TO build_an_event_store;
EOSQL
