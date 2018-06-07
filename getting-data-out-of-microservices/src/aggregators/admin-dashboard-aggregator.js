const createMessageRouter = require('../message-router')
const messages = require('../messages')

const componentId = 'aggregators:admin-dashboard'
const pageName = 'admin-dashboard'

function createHandlers({ queries }) {
  return {
    [messages.eventTypes.systemInitialized]: queries.init,
    [messages.eventTypes.productAdded]: queries.incrementProductCount,
    [messages.eventTypes.userRegistered]: queries.incrementUserCount,
  }
}

function createQueries({ db }) {
  function init() {
    const initialData = {
      page_name: pageName,
      page_data: { productCount: 0, userCount: 0 },
    }

    return db.client('read_model_pages').insert(initialData)
  }

  function incrementProductCount() {
    const queryString = `
      UPDATE
        read_model_pages
      SET
        page_data = jsonb_set(page_data, '{productCount}', (COALESCE(page_data->>'productCount', '0')::int + 1)::text::jsonb)
      WHERE
        page_name = '${pageName}'
    `

    return db.client.raw(queryString)
  }

  function incrementUserCount() {
    const queryString = `
      UPDATE
        read_model_pages
      SET
        page_data = jsonb_set(page_data, '{userCount}', (COALESCE(page_data->>'userCount', '0')::int + 1)::text::jsonb)
      WHERE
        page_name = '${pageName}'
    `

    return db.client.raw(queryString)
  }

  return { incrementProductCount, incrementUserCount, init }
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
