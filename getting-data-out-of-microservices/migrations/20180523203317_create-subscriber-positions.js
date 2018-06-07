exports.up = function up(knex) {
  return knex.schema.createTable('event_store_subscriber_positions', table => {
    table.string('id').primary()
    table.integer('position')
  })
}

exports.down = knex => knex.schema.dropTable('event_store_subscriber_positions')
