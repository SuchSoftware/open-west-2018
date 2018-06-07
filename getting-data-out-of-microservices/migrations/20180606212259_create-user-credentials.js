exports.up = knex =>
  knex.schema.createTable('read_model_user_credentials', table => {
    table.string('id').primary()
    table.string('email').notNullable()
    table.string('password_hash').notNullable()
  })

exports.down = knex => knex.schema.dropTable('read_model_user_credentials')
