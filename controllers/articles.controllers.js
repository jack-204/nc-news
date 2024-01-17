const {fetchArticleById, fetchAllArticles, updateArticleVotes} = require('../models/articles.models')
const{checkArticleExists} = require('../utils/check-exists')

exports.getArticleById = (req, res, next) => {
    const {article_id} = req.params
    fetchArticleById(article_id).then((article) => {
        res.status(200).send({ article })
    }).catch((err) => {
        next(err)
    })
}

exports.getAllArticles = (req, res, next) => {
    fetchAllArticles().then((articles) => {
        res.status(200).send({ articles })
    })
}

exports.patchArticleVotes = (req, res, next) => {
    const {article_id} = req.params
    const {inc_votes} = req.body

    if (!inc_votes) {
        fetchArticleById(article_id).then((article) => {
            res.status(200).send({article})
        })
    }
    const query1 = updateArticleVotes(article_id, inc_votes)
    const queries = [query1]

    const query2 = checkArticleExists(article_id)
    queries.push(query2)

    Promise.all(queries)

    .then((results) => {
        const article = results[0]
        res.status(200).send({article})
    }).catch((err) => {
        next(err)
    })
}