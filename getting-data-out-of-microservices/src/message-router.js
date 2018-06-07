const Bluebird = require('bluebird')

function createRouter(componentId, handlers) {
  function processMessage(message) {
    const handler = handlers[message.type]

    return handler ? handler(message) : Bluebird.resolve(true)
  }

  function processMessages(messages) {
    return Bluebird.each(messages, processMessage)
  }

  return { processMessage, processMessages }
}

module.exports = createRouter
