exports.up = knex =>
  knex.schema.createTable('read_model_products', table => {
    table.string('id').primary()
    table.string('name').notNullable()
    table.string('description').notNullable()
  })

exports.down = knex => knex.schema.dropTable('read_model_products')
