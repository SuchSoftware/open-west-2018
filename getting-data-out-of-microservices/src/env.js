const colors = require('colors/safe')
const dotenv = require('dotenv')

const packageJson = require('../package.json')

const envFromRealEnvironment = process.env.NODE_ENV || 'development'
const path = `.env.${envFromRealEnvironment}`

dotenv.config({ path, silent: envFromRealEnvironment === 'production' })

function requireFromEnv(key) {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.error(`${colors.red('[APP ERROR] Missing env variable:')} ${key}`)

    return process.exit(1)
  }

  return process.env[key]
}

module.exports = {
  allowWipe: requireFromEnv('ALLOW_WIPE'),
  appName: requireFromEnv('APP_NAME'),
  env: requireFromEnv('NODE_ENV'),
  eventStoreConnectionString: requireFromEnv('EVENT_STORE_CONNECTION_STRING'),
  port: parseInt(requireFromEnv('PORT'), 10),
  readModelConnectionString: requireFromEnv('READ_MODEL_CONNECTION_STRING'),
  version: packageJson.version,
  workingDir: process.cwd(),
}
