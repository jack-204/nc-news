const express = require('express')
const app = express()

app.use(express.json())

const apiRouter = require('./routes/api-router')

app.use('/api', apiRouter)

app.use((err, req, res, next) => {
    if(err.status && err.msg) { //custom error handling
        res.status(err.status).send({msg: err.msg})
    } else if (err.code === '22P02' || err.code === '23502' || err.code === '23503') { // psql error handling
        res.status(400).send({msg: 'Bad request'})
    }
})

module.exports = app