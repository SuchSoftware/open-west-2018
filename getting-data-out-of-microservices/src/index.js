const { join } = require('path')

const createExpressApp = require('./app/express')
const createConfig = require('./config')
const env = require('./env')

const config = createConfig({ env })
const publicDir = join(env.workingDir, 'src', 'public')
const app = createExpressApp({ config, publicDir })

function start() {
  config.eventStore.start().then(() => {
    app.listen(env.port, signalAppStart)
    config.aggregators.forEach(a => a.subscribeToStore(config.eventStore))
    config.services.forEach(s => s.subscribeToStore(config.eventStore))
  })
}

function signalAppStart() {
  console.log(`${env.appName} started`)
  console.table([['Port', env.port], ['Environment', env.env]])
}

module.exports = {
  app,
  config,
  start,
}
