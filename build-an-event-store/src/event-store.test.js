const test = require('blue-tape')

const createDb = require('./db')
const createEventStore = require('./event-store')

const db = createDb()
const eventStore = createEventStore(db)

// knex and tape don't play well together, so we need to give a little help
//   and explicitly shut down the knex client when the tests are done.
//   Otherwise, we end up hanging here.
test.onFinish(() => {
  db.destroy()
})

function reset() {
  return db('event_store_commits')
    .del()
    .then(() => db('event_store_messages').del())
}

test('Emits message(s) to a stream', t => {
  const streamType = 'videos'
  const streamId = '12345'
  const stream = `${streamType}:${streamId}`
  const video1Uploaded = { type: 'VideoUploaded' }
  const video1Transcoded = { type: 'VideoTranscoded' }

  const messages = [video1Uploaded, video1Transcoded]

  return reset()
    .then(() => eventStore.emit(stream, messages))
    .then(() =>
      eventStore.getAll().then(emitted => {
        t.equal(emitted.length, 2, 'Emitted the messages')
        t.equal(emitted[0].type, messages[0].type, 'Correct type')
        t.equal(emitted[1].type, messages[1].type, 'Correct type')
      }),
    )
})

test('Fetches a stream with a projection', t => {
  const videoUploadedType = 'VideoUploaded'
  const videoTranscodedType = 'VideoTranscoded'

  const stream1Type = 'videos'
  const stream1Id = '12345'
  const stream1 = `${stream1Type}:${stream1Id}`
  const video1Uploaded = { type: videoUploadedType }
  const video1Transcoded = { type: videoTranscodedType }

  const stream2Type = 'videos'
  const stream2Id = '54321'
  const stream2 = `${stream2Type}:${stream2Id}`
  const video2Uploaded = { type: videoUploadedType }

  const messages1 = [video1Uploaded, video1Transcoded]
  const messages2 = [video2Uploaded]

  const hasBeenTranscodedProjection = {
    $init: { hasBeenTranscoded: false },
    [videoTranscodedType]: (state, event) =>
      Object.assign({}, state, { hasBeenTranscoded: true, id: event.streamId }),
  }

  return reset()
    .then(() => eventStore.emit(stream1, messages1))
    .then(() => eventStore.emit(stream2, messages2))
    .then(() =>
      eventStore
        .fetchStream(stream1, hasBeenTranscodedProjection)
        .then(projectedStream => {
          t.equal(projectedStream.id, stream1Id, 'Correct id')
          t.ok(projectedStream.hasBeenTranscoded, 'Has been transcoded')
        }),
    )
    .then(() =>
      eventStore
        .fetchStream(stream2, hasBeenTranscodedProjection)
        .then(projectedStream => {
          t.notOk(projectedStream.hasBeenTranscoded, 'Has not been transcoded')
        }),
    )
})
