exports.up = knex =>
  knex.schema.createTable('read_model_pages', table => {
    table.string('page_name').primary()

    table.jsonb('page_data').defaultsTo('{}')
  })

exports.down = knex => knex.schema.dropTable('read_model_pages')
