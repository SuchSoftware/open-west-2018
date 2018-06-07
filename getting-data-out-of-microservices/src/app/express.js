/*
The application layer of the system uses [express](https://expressjs.com/) to handle
routing HTTP requests.  This file sets up the express application.
*/

const bodyParser = require('body-parser')
const express = require('express')
const uuid = require('uuid/v4')

function primeRequestContext(req, res, next) {
  req.context = {
    correlationId: uuid(),
  }

  next()
}

function createExpressApp({ config, publicDir }) {
  const app = express()

  app.set('views', __dirname)
  app.set('view engine', 'pug')

  app.use(express.static(publicDir))
  app.use(primeRequestContext)

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use('/', config.home.router)
  app.use('/admin', config.admin.router)
  app.use('/login', config.authenticateUsers.router)
  app.use('/products', config.products.router)
  app.use('/register', config.registerUsers.router)

  app.use((err, req, res, next) => {
    if (err.message === 'duplicate') {
      res.status(400).send('duplicate')
    }

    next(err)
  })

  return app
}

module.exports = createExpressApp
