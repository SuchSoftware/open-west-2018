const camelCaseKeys = require('camelcase-keys')

function createSubscribe({
  db,
  initialize,
  messagesTableName,
  subscriberPositionsTableName,
}) {
  const subscriptions = []

  /**
   * @description - Wraps up setting a
   *   subscriber's read position
   */
  function setSubscriberPosition(subscriber, position) {
    return db.upsert({
      constraint: 'id',
      object: { id: subscriber.id, position },
      table: subscriberPositionsTableName,
    })
  }

  /**
   * @description - Listen to messages on the given stream.  Can be a specific
   *   stream or a category stream.
   */
  function subscribe(subscriberId, handler) {
    subscriptions.push({ id: subscriberId, handler })
  }

  function getNext(subscriber) {
    return getSubscriberPosition(subscriber)
      .then(position =>
        db
          .client(messagesTableName)
          .where('id', '>', position)
          .orderBy('id', 'ASC')
          .limit(1)
          .then(camelCaseKeys),
      )
      .then(rows => rows[0])
  }

  function getSubscriberPosition(subscriber) {
    return db
      .client(subscriberPositionsTableName)
      .where('id', subscriber.id)
      .then(rows => {
        if (rows.length === 0) return 0

        return rows[0].position
      })
  }

  function processMessage(subscriber, message) {
    return subscriber.handler(message)
  }

  /**
   * @description - Generally not called from the outside.  This function is
   *   called on each of the timeouts to see if there are new events that need
   *   publishing.
   */
  function tick() {
    return subscriptions.reduce(
      (chain, subscriber) =>
        chain.then(() => getNext(subscriber)).then(message => {
          if (!message) return Promise.resolve(null)

          return processMessage(subscriber, message)
            .then(() => setSubscriberPosition(subscriber, message.id))
            .catch(err => {
              // eslint-disable-next-line no-console
              console.error(
                'error processing:\n',
                `\t${subscriber.id}\n`,
                `\t${message.id}\n`,
                `\t${err}\n`,
              )
            })
        }),
      Promise.resolve(true),
    )
  }

  function poll() {
    return tick().then(() => setTimeout(poll, 1000))
  }

  function start() {
    return initialize().then(() => poll())
  }

  return {
    start,
    subscribe,
  }
}

module.exports = createSubscribe
