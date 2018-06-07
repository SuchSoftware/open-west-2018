const knex = require('knex')

function createDb({ allowWipe, connectionString, tables }) {
  const client = knex(connectionString)

  const retval = {
    client,
  }

  /**
     * @description - Performs an upsert
     * @param {Object} params - the thing to upsert
     * @returns {Object} - The thing that was upserted
     */
  function upsert(params) {
    const { constraint, object, table } = params
    const insert = client(table).insert(object)
    const update = client.update(object)
    const raw = `${insert} ON CONFLICT (${constraint}) DO ${update} returning *`

    return client.raw(raw).then(res => res.rows[0])
  }

  retval.upsert = upsert

  /**
     * @describes - Destroys and recreates the db. Testing likes clean
     *   environments.  Production does not.  This only gets enabled if
     *   the `allowWipe` setting is true.
    */
  function wipe() {
    return tables.reduce(
      (chain, t) => chain.then(() => client(t).del()),
      Promise.resolve(true),
    )
  }

  // Some things aren't meant for non-test environments.
  if (allowWipe) {
    retval.wipe = wipe
  }

  return retval
}

module.exports = createDb
