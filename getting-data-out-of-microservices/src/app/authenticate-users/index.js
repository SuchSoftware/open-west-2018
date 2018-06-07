const camelCaseKeys = require('camelcase-keys')
const express = require('express')

const lolHash = require('../lol-hash')
const messages = require('../../messages')

function createActions({ eventStore, queries }) {
  function authenticateUser(context, email, password) {
    return queries.findUserCredentialByEmail(email).then(existing => {
      if (!existing) {
        return null
      }

      const passwordsMatch = lolHash(password) === existing.passwordHash

      if (!passwordsMatch) {
        return null
      }

      const stream = `users:${existing.id}`

      const event = messages.events.userLoggedIn(
        context.correlationId,
        existing.id,
      )

      const toEmit = [{ stream, messages: [event] }]

      return eventStore.emit(toEmit).then(() => existing)
    })
  }

  return { authenticateUser }
}

function createHandlers({ actions }) {
  function handleAuthenticateUser(req, res, next) {
    actions
      .authenticateUser(req.context, req.body.email, req.body.password)
      .then(userCredential => {
        const responseText = userCredential
          ? `authenticated ${userCredential.email}`
          : 'did not authenticate'

        return res.send(responseText)
      })
      .catch(next)
  }

  return { handleAuthenticateUser }
}

function createQueries({ db }) {
  function findUserCredentialByEmail(email) {
    return db
      .client('read_model_user_credentials')
      .where({ email })
      .limit(1)
      .then(camelCaseKeys)
      .then(rows => rows[0])
  }

  return { findUserCredentialByEmail }
}

function createAuthenticateUsers({ db, eventStore }) {
  const queries = createQueries({ db })
  const actions = createActions({ eventStore, queries })
  const handlers = createHandlers({ actions })
  const router = express.Router()

  router.route('/').post(handlers.handleAuthenticateUser)

  return {
    actions,
    queries,
    router,
  }
}

module.exports = createAuthenticateUsers
