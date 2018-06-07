const createInitializer = require('./init')
const createRead = require('./read')
const createSubscribe = require('./subscribe')
const createWrite = require('./write')

function createEventStore({
  db,
  commitsTableName = 'event_store_commits',
  messagesTableName = 'event_store_messages',
  subscriberPositionsTableName = 'event_store_subscriber_positions',
}) {
  const initializer = createInitializer({ db, messagesTableName })
  const read = createRead({ db, messagesTableName })
  const subscribe = createSubscribe({
    db,
    initialize: initializer.init,
    messagesTableName,
    subscriberPositionsTableName,
  })
  const write = createWrite({ db, commitsTableName, messagesTableName })

  return {
    emit: write.emit,
    fetchStream: read.fetchStream,
    getAll: read.getAll,
    start: subscribe.start,
    subscribe: subscribe.subscribe,
  }
}

module.exports = createEventStore
