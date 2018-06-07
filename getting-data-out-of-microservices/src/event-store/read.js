const camelCaseKeys = require('camelcase-keys')

function createRead({ db, messagesTableName }) {
  /**
   * @description Fetches a stream and runs it through a projection
   * @param {string} stream The stream to fetch
   * @param {object} projection The projection to run it through
   * @param {object} projection.$init Starting state for the projection
   */
  function fetchStream(stream, projection) {
    const [streamType, streamId] = stream.split(':')

    return db
      .client(messagesTableName)
      .where({ stream_type: streamType, stream_id: streamId })
      .then(camelCaseKeys)
      .then(messages =>
        messages.reduce((state, message) => {
          if (!projection[message.type]) {
            return state
          }

          return projection[message.type](state, message)
        }, projection.$init),
      )
  }

  /**
   * @description This is a debug-only function.  It simply gets all of the
   *   messages in the store.  Please, please, don't use this in production.
   */
  function getAll() {
    return db.client(messagesTableName).then(camelCaseKeys)
  }

  return { fetchStream, getAll }
}

module.exports = createRead
