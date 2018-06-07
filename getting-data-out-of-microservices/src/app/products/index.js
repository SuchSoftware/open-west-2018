const camelCaseKeys = require('camelcase-keys')
const cuid = require('cuid')
const express = require('express')

const messages = require('../../messages')

function createActions({ eventStore, queries }) {
  function addProduct(context, name, description) {
    const productId = cuid()

    const event = messages.events.productAdded(
      context.correlationId,
      'someone',
      name,
      description,
    )

    const toEmit = [{ stream: `products:${productId}`, messages: [event] }]

    return eventStore.emit(toEmit)
  }

  return { addProduct }
}

function createHandlers({ actions, queries }) {
  function handleAddProduct(req, res, next) {
    actions
      .addProduct(req.context, req.body.name, req.body.description)
      .then(() => res.send('product added'))
      .catch(next)
  }

  function handleSearchProducts(req, res) {
    queries
      .search(req.query.q)
      .then(products =>
        res.render('products/templates/search-results', { products }),
      )
  }

  function handleShowProductForm(req, res) {
    res.render('products/templates/add')
  }

  return { handleAddProduct, handleSearchProducts, handleShowProductForm }
}

function createQueries({ elasticsearch }) {
  function search(q) {
    return elasticsearch
      .search({
        index: 'products',
        type: 'product',
        body: {
          query: {
            match: {
              description: q,
            },
          },
        },
      })
      .then(result =>
        result.hits.hits.map(hit => ({
          id: hit._id,
          name: hit._source.name,
          description: hit._source.description,
        })),
      )
  }

  return { search }
}

function createRegisterUsers({ elasticsearch, eventStore }) {
  const queries = createQueries({ elasticsearch })
  const actions = createActions({ eventStore, queries })
  const handlers = createHandlers({ actions, queries })
  const router = express.Router()

  router
    .route('/')
    .get(handlers.handleShowProductForm)
    .post(handlers.handleAddProduct)

  router.route('/search/').get(handlers.handleSearchProducts)

  return {
    actions,
    queries,
    router,
  }
}

module.exports = createRegisterUsers
