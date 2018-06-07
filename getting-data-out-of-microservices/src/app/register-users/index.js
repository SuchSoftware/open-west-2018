const camelCaseKeys = require('camelcase-keys')
const cuid = require('cuid')
const express = require('express')

const lolHash = require('../lol-hash')
const messages = require('../../messages')

function createActions({ eventStore, queries }) {
  function registerUser(context, email, password) {
    return queries.findUserCredentialByEmail(email).then(existingUser => {
      if (existingUser) {
        throw new Error('duplicate')
      }

      const userId = cuid()

      const event = messages.events.userRegistered(
        context.correlationId,
        userId,
        email,
        lolHash(password),
      )

      const toEmit = [{ stream: `users:${userId}`, messages: [event] }]

      return eventStore.emit(toEmit)
    })
  }

  return { registerUser }
}

function createHandlers({ actions }) {
  function handleRegisterUser(req, res, next) {
    actions
      .registerUser(req.context, req.body.email, req.body.password)
      .then(() => res.send('registered'))
      .catch(next)
  }

  return { handleRegisterUser }
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

function createRegisterUsers({ db, eventStore }) {
  const queries = createQueries({ db })
  const actions = createActions({ eventStore, queries })
  const handlers = createHandlers({ actions })
  const router = express.Router()

  router.route('/').post(handlers.handleRegisterUser)

  return {
    actions,
    queries,
    router,
  }
}

module.exports = createRegisterUsers
