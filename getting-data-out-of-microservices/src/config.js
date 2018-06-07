/*
The system makes heavy use of dependency injection.  This file wires up all the
dependencies, making use of the environment.
*/

const createAdminDashboardAggregator = require('./aggregators/admin-dashboard-aggregator')
const createProductsAggregator = require('./aggregators/products-aggregator')
const createProductsSearchAggregator = require('./aggregators/products-search-aggregator')
const createUserCredentialsAggregator = require('./aggregators/user-credentials-aggregator')
const createAuthenticateUsers = require('./app/authenticate-users')
const createAdmin = require('./app/admin')
const createHome = require('./app/home')
const createProducts = require('./app/products')
const createRegisterUsers = require('./app/register-users')
const createDb = require('./db')
const createElasticSearch = require('./elasticsearch')
const createEventStore = require('./event-store')

function createConfig({ env }) {
  const eventStoreDb = createDb({
    allowWipe: env.allowWipe,
    connectionString: env.eventStoreConnectionString,
    tables: [
      'event_store_commits',
      'event_store_messages',
      'event_store_subscriber_positions',
    ],
  })

  const readModelDb = createDb({
    allowWipe: env.allowWipe,
    connectionString: env.readModelConnectionString,
    tables: [
      'read_model_user_credentials',
      'read_model_pages',
      'read_model_products',
    ],
  })

  const eventStore = createEventStore({ db: eventStoreDb })

  const elasticsearch = createElasticSearch()

  // Configure aggregators
  const adminDashboardAggregator = createAdminDashboardAggregator({
    db: readModelDb,
  })
  const productsAggregator = createProductsAggregator({ db: readModelDb })
  const productsSearchAggregator = createProductsSearchAggregator({
    elasticsearch,
  })
  const userCredentialsAggregator = createUserCredentialsAggregator({
    db: readModelDb,
  })
  const aggregators = [
    adminDashboardAggregator,
    productsAggregator,
    productsSearchAggregator,
    userCredentialsAggregator,
  ]

  // Configure services
  const services = []

  // Configure application layer
  const admin = createAdmin({ db: readModelDb })
  const authenticateUsers = createAuthenticateUsers({
    db: readModelDb,
    eventStore,
  })
  const home = createHome({ db: readModelDb })
  const products = createProducts({ elasticsearch, eventStore })
  const registerUsers = createRegisterUsers({ db: readModelDb, eventStore })

  return {
    admin,
    aggregators,
    authenticateUsers,
    eventStore,
    eventStoreDb,
    home,
    products,
    readModelDb,
    registerUsers,
    services,
    userCredentialsAggregator,
  }
}

module.exports = createConfig
