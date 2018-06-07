const bluebird = require('bluebird')
const express = require('express')

function createHandlers({ queries }) {
  function handleAdminDashboard(req, res, next) {
    const countPromises = [queries.countUsers(), queries.countProducts()]

    Promise.all(countPromises)
      .then(([userCount, productCount]) =>
        res.render('admin/templates/dashboard', { productCount, userCount }),
      )
      .catch(next)
  }

  function handleAdminDashboardBetter(req, res, next) {
    queries
      .loadDashboard()
      .then(dashboard => {
        const { productCount, userCount } = dashboard.page_data

        res.render('admin/templates/dashboard', { productCount, userCount })
      })
      .catch(next)
  }

  return { handleAdminDashboard, handleAdminDashboardBetter }
}

function createQueries({ db }) {
  function countProducts() {
    return (
      bluebird
        // We have SO MANY users!!1!
        .delay(5000)
        .then(() => db.client('read_model_products').count('id'))
        .then(res => res[0].count)
    )
  }

  function countUsers() {
    return (
      bluebird
        // We have SO MANY users!!1!
        .delay(5000)
        .then(() => db.client('read_model_user_credentials').count('id'))
        .then(res => res[0].count)
    )
  }

  function loadDashboard() {
    return db
      .client('read_model_pages')
      .where({ page_name: 'admin-dashboard' })
      .limit(1)
      .then(rows => rows[0])
  }

  return { countProducts, countUsers, loadDashboard }
}

function createAuthenticateUsers({ db }) {
  const queries = createQueries({ db })
  const handlers = createHandlers({ queries })
  const router = express.Router()

  router.route('/').get(handlers.handleAdminDashboard)
  router.route('/better').get(handlers.handleAdminDashboardBetter)

  return {
    queries,
    router,
  }
}

module.exports = createAuthenticateUsers
