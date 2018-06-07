exports.up = function up(knex) {
  return knex.schema.createTable('event_store_messages', table => {
    table.increments()
    table.string('type')
    table.string('stream_type')
    table.string('stream_id')
    table.string('correlation_id')
    table.integer('version')
    table.json('payload')
    table.timestamp('timestamp').defaultTo(knex.fn.now())

    table.index('type')
    table.index('stream_type')
    table.index('stream_id')
  })
}

exports.down = knex => knex.schema.dropTable('event_store_messages')
