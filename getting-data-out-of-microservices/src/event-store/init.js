/*
The code in here is used for initializing a brand new system.
*/

const camelCaseKeys = require('camelcase-keys')

const messages = require('../messages')

function createInit({ db, messagesTableName }) {
  function init() {
    return findInitEvent().then(initEvent => {
      if (initEvent) {
        return true
      }

      return writeInitEvent()
    })
  }

  function findInitEvent() {
    return db
      .client(messagesTableName)
      .where({ type: messages.eventTypes.systemInitialized })
      .limit(1)
      .then(camelCaseKeys)
      .then(rows => rows[0])
  }

  function writeInitEvent() {
    const systemInitializedEvent = messages.events.systemInitialized(
      'system start',
      'system',
    )

    const insertable = {
      ...systemInitializedEvent,
      stream_type: 'system',
      stream_id: 'system',
      version: 0,
    }

    return db.client(messagesTableName).insert(insertable)
  }

  return { init, findInitEvent, writeInitEvent }
}

module.exports = createInit
