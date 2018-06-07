const elasticsearch = require('elasticsearch')

function createElasticSearch() {
  return new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace',
  })
}

module.exports = createElasticSearch
