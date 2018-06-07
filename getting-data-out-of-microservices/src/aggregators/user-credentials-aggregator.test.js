const test = require('blue-tape')

const messages = require('../messages')
const { config, reset } = require('../test-helper')

test('It aggregates user credentials', t => {
  const userId = 'test-id'
  const email = 'test@example.com'
  const userRegisteredEvent = messages.events.userRegistered(
    'test',
    userId,
    email,
    'not a hash',
  )
  userRegisteredEvent.streamType = 'users'
  userRegisteredEvent.streamId = userId

  return reset()
    .then(() =>
      config.userCredentialsAggregator.router.processMessages([
        userRegisteredEvent,
      ]),
    )
    .then(() =>
      config.registerUsers.queries
        .findUserCredentialByEmail(email)
        .then(credential => {
          t.ok(credential, 'It got the credential')
          t.equal(credential.email, email, 'Correct email')
        }),
    )
})
