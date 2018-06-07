const test = require('blue-tape')
const snakeCaseKeys = require('snakecase-keys')
const supertest = require('supertest')

const { app, config, reset } = require('../../test-helper')

test('Catches duplicate username', t => {
  const existingUser = {
    id: 'existinguser',
    email: 'existing@example.com',
    passwordHash: 'not a hash, but whatevs',
  }

  const duplicate = {
    email: existingUser.email,
    password: 'does not really matter',
  }

  return reset()
    .then(() =>
      config.readModelDb
        .client('read_model_user_credentials')
        .insert(snakeCaseKeys(existingUser)),
    )
    .then(() =>
      supertest(app)
        .post('/register')
        .type('form')
        .send(duplicate)
        .expect(400),
    )
})

test('Registers a user', t => {
  const attributes = {
    email: 'existing@example.com',
    password: 'not a hash, but whatevs',
  }

  return reset()
    .then(() =>
      supertest(app)
        .post('/register')
        .type('form')
        .send(attributes)
        .expect(302),
    )
    .then(() =>
      config.eventStore.getAll().then(events => {
        t.equal(events.length, 1, '1 event')
      }),
    )
})
