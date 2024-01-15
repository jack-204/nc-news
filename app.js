const express = require('express')
const app = express()

const {getTopics} = require('./controllers/topics.controllers')
const {getEndpoints} = require('./controllers/api.controllers')

app.get('/api/topics', getTopics)

app.get('/api', getEndpoints)

module.exports = app