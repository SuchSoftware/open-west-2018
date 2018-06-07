#!/bin/bash

# Modified from:
# https://hub.docker.com/_/postgres/
set -e

echo $POSTGRES_USER
echo $POSTGRES_DB

psql -v ON_ERROR_STOP=1 -v VERBOSITY=verbose --username "$POSTGRES_USER" <<-EOSQL
  CREATE DATABASE getting_data_out_of_microservices_test;
  \c getting_data_out_of_microservices

  GRANT ALL PRIVILEGES ON DATABASE getting_data_out_of_microservices_test TO getting_data_out_of_microservices;
  ALTER DEFAULT PRIVILEGES FOR ROLE getting_data_out_of_microservices IN SCHEMA PUBLIC GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO getting_data_out_of_microservices;
  ALTER DEFAULT PRIVILEGES FOR ROLE getting_data_out_of_microservices IN SCHEMA PUBLIC GRANT EXECUTE ON FUNCTIONS TO getting_data_out_of_microservices;
EOSQL
