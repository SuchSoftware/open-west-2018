const createMessageRouter = require('../message-router')
const messages = require('../messages')

const componentId = 'aggregators:user-credentials'

function createHandlers({ queries }) {
  return {
    [messages.eventTypes.userRegistered]: event =>
      queries.createUserCredentials(
        event.streamId,
        event.payload.email,
        event.payload.passwordHash,
      ),
  }
}

function createQueries({ db }) {
  function createUserCredentials(id, email, passwordHash) {
    return db
      .client('read_model_user_credentials')
      .insert({ id, email, password_hash: passwordHash })
  }

  return { createUserCredentials }
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
