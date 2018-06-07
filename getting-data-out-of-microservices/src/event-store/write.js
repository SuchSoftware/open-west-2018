function createWrite({ db, commitsTableName, messagesTableName }) {
  /**
   * @description Emits messages to stream(s)
   * @param {Object[]} messages
   * @param {string} messages[].stream A stream to emit to
   * @param {Object} messages[].messages The messages to emit to the
   *   corresponding stream
   */
  function emit(messages) {
    return db.client.transaction(trx =>
      Promise.all(
        messages.map(messageBundle =>
          loadOrCreateCommitForStream(trx, messageBundle.stream)
            .then(commitRow =>
              validateExpectedVersion(commitRow, messageBundle.expectedVersion),
            )
            .then(commitRow =>
              writeMessagesToStream(
                trx,
                commitRow.version,
                messageBundle.stream,
                messageBundle.messages,
              ),
            )
            .then(updateCount =>
              verifyCommitRowUpdated(messageBundle.stream, updateCount),
            ),
        ),
      ),
    )
  }

  /**
   * @description Loads or creates a commit record for the given stream. If it
   * creates the record, the version will start at 0.
   * @param {object} trx A knex transaction object
   * @param {string} stream The stream in question
   * @returns {Promise{Object}} A promise resolving to the commit row
   */
  function loadOrCreateCommitForStream(trx, stream) {
    return trx(commitsTableName)
      .where({ stream })
      .then(rows => rows[0])
      .then(row => {
        if (!row) {
          const commitRow = { stream, version: 0 }

          return trx(commitsTableName)
            .insert(commitRow)
            .then(() => commitRow)
        }

        return row
      })
  }

  /**
   * @description Given a commit row and an expected version, it'll check to see
   * if the stream is currently at the expected version.  If not, it throws an error.
   * @param {object} commitRow The commit record
   * @param {string} commitRow.stream The stream of the commit record
   * @param {number} commitRow.version The stream's current version
   * @param {number?} expectedVersion If there is an expected version, it'll be
   * a number
   * @throws {Error} A version conflict error if there is an expected version and
   * the stream is not currently at that version
   * @returns {object} The commit row if there was not conflict error
   */
  function validateExpectedVersion(commitRow, expectedVersion) {
    if (typeof expectedVersion !== 'undefined') {
      if (commitRow.version !== expectedVersion) {
        const errorMessage = [
          'VersionConflict: stream',
          commitRow.stream,
          'expected version',
          expectedVersion,
          'but was at version',
          commitRow.version,
        ].join(' ')

        throw new Error(errorMessage)
      }
    }

    return commitRow
  }

  /**
   *
   * @param {string} stream The stream in question
   * @param {number} updateCount The number of rows updated in the commit table
   * @throws {error} a version conflict error if the updated count is not 1
   */
  function verifyCommitRowUpdated(stream, updateCount) {
    if (updateCount !== 1) {
      const errorMessage = [
        'VersionConflict: stream',
        stream,
        'was previously modified',
      ].join(' ')

      throw new Error(errorMessage)
    }
  }

  /**
   * @description Writes `messages` to `stream`.
   * @param {object} trx Knex transaction object
   * @param {number} currentVersion The stream's current version
   * @param {string} stream The stream to write to
   * @param {array{object}} The messages to emit
   * @param {array{object}} messages The messages to write
   * @returns {Promise{number}} A promise resolving to the number of rows updated
   * in the commits table
   */
  function writeMessagesToStream(trx, currentVersion, stream, messages) {
    const [streamType, streamId] = stream.split(':')
    const nextVersion = currentVersion + 1
    const insertables = messages.map(m =>
      Object.assign(
        {
          stream_type: streamType,
          stream_id: streamId,
          version: nextVersion,
        },
        m,
      ),
    )

    return trx(messagesTableName)
      .insert(insertables)
      .then(() =>
        trx(commitsTableName)
          .update({ version: nextVersion })
          .where({ stream, version: currentVersion }),
      )
  }

  return { emit }
}

module.exports = createWrite
