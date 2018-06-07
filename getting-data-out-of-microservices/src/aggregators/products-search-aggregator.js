const createMessageRouter = require('../message-router')
const messages = require('../messages')

const componentId = 'aggregators:products-search'

function createHandlers({ queries }) {
  return {
    [messages.eventTypes.productAdded]: event =>
      queries.addProductToES(
        event.streamId,
        event.payload.name,
        event.payload.description,
      ),
  }
}

function createQueries({ elasticsearch }) {
  function addProductToES(id, name, description) {
    return elasticsearch.index({
      index: 'products',
      type: 'product',
      id,
      body: { name, description },
    })
  }

  return { addProductToES }
}

function createAggregator({ elasticsearch }) {
  const queries = createQueries({ elasticsearch })
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
