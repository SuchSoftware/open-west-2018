exports.up = knex =>
  knex.schema.createTable('event_store_commits', table => {
    table.string('stream').primary()
    table.integer('version').defaultsTo(0)
  })

exports.down = knex => knex.schema.dropTable('event_store_commits')
