const eventTypes = {
  productAdded: 'ProductAdded',
  systemInitialized: 'SystemInitialized',
  userLoggedIn: 'UserLoggedIn',
  userRegistered: 'UserRegistered',
}

const events = {
  productAdded(correlationId, userId, name, description) {
    return {
      type: eventTypes.productAdded,
      correlation_id: correlationId,
      user_id: userId,
      payload: { name, description },
      timestamp: new Date(),
    }
  },
  systemInitialized(correlationId, userId) {
    return {
      type: eventTypes.systemInitialized,
      correlation_id: correlationId,
      user_id: userId,
      payload: {},
      timestamp: new Date(),
    }
  },
  userLoggedIn(correlationId, userId) {
    return {
      type: eventTypes.userLoggedIn,
      correlation_id: correlationId,
      user_id: userId,
      payload: {},
      timestamp: new Date(),
    }
  },
  userRegistered(correlationId, userId, email, passwordHash) {
    return {
      type: eventTypes.userRegistered,
      correlation_id: correlationId,
      user_id: userId,
      payload: { email, passwordHash },
      timestamp: new Date(),
    }
  },
}

exports.eventTypes = eventTypes
exports.events = events
