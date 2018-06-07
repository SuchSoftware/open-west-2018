const express = require('express')

function createHandlers() {
  function home(req, res) {
    res.render('home/templates/home')
  }

  return { home }
}

function createQueries({ db }) {
  return {}
}

function createHome({ db }) {
  const queries = createQueries({ db })
  const handlers = createHandlers({ queries })

  const router = express.Router()

  router.route('/').get(handlers.home)

  return { handlers, queries, router }
}

module.exports = createHome
