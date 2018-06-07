const createMessageRouter = require('../message-router')
const messages = require('../messages')

const componentId = 'aggregators:products'

function createHandlers({ queries }) {
  return {
    [messages.eventTypes.productAdded]: event =>
      queries.createProduct(
        event.streamId,
        event.payload.name,
        event.payload.description,
      ),
  }
}

function createQueries({ db }) {
  function createProduct(id, name, description) {
    return db.client('read_model_products').insert({ id, name, description })
  }

  return { createProduct }
}

function createAggregator({ db }) {
  const queries = createQueries({ db })
  const handlers = createHandlers({ queries })
  const router = createMessageRouter(componentId, handlers)

  function subscribeToStore(eventStore) {
    eventStore.subscribe(componentId, router.processMessage)
  }

  return {
    handlers,
    queries,
    router,
    subscribeToStore,
  }
}

module.exports = createAggregator
