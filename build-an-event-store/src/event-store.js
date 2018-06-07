const camelCaseKeys = require('camelcase-keys')

function createEventStore(db) {
  /**
   * @description Emits messages to stream(s)
   * @param {Object[]} messages
   * @param {string} messages[].stream A stream to emit to
   * @param {Object} messages[].messages The messages to emit to the
   *   corresponding stream
   */

  function emit(stream, messages) {
    // Split the stream, e.g. users:12345
    const [streamType, streamId] = stream.split(':')

    // Put the stream columns on the messages
    const insertables = messages.map(m => ({
      ...m,
      stream_type: streamType,
      stream_id: streamId,
    }))

    // Write them to the database
    return db('event_store_messages').insert(insertables)
  }

  function fetchStream(stream, projection) {
    // split the stream
    const [streamType, streamId] = stream.split(':')

    // read the events for the stream
    return (
      db('event_store_messages')
        .where({ stream_type: streamType, stream_id: streamId })
        // camel case things
        .then(camelCaseKeys)
        .then(messages =>
          // reduce over them
          messages.reduce((state, message) => {
            if (!projection[message.type]) {
              return state
            }

            // profit
            return projection[message.type](state, message)
          }, projection.$init),
        )
    )
  }

  /**
   * @description This is a debug-only function.  It simply gets all of the
   *   messages in the store.  Please, please, don't use this in production.
   */
  function getAll() {
    return db('event_store_messages').then(camelCaseKeys)
  }

  return {
    emit,
    fetchStream,
    getAll,
  }
}

module.exports = createEventStore
