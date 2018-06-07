const knex = require('knex')

const connectionString =
  'postgres://build_an_event_store:build_an_event_store@localhost:5432/build_an_event_store_test'

function createDb() {
  return knex(connectionString)
}

module.exports = createDb
