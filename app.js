const express = require('express')
const app = express()

const {getTopics} = require('./controllers/topics.controllers')
const {getEndpoints} = require('./controllers/api.controllers')
const {getArticleById, getAllArticles} = require('./controllers/articles.controllers')
const {getCommentsFromArticle} = require('./controllers/comments.controllers')

app.get('/api/topics', getTopics)

app.get('/api', getEndpoints)

app.get('/api/articles/:article_id', getArticleById)

app.get('/api/articles', getAllArticles)

app.get('/api/articles/:article_id/comments', getCommentsFromArticle)

app.use((err, req, res, next) => {
    if(err.status && err.msg) { //custom error handling
        res.status(err.status).send({msg: err.msg})
    } else if (err.code === '22P02') { // psql error handling
        res.status(400).send({msg: 'Bad request'})
    }
})

module.exports = app