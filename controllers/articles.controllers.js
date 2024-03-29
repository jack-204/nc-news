const {fetchArticleById, fetchAllArticles, updateArticleVotes, addNewArticle} = require('../models/articles.models')
const{checkArticleExists, checkTopicExists} = require('../utils/check-exists')

exports.getArticleById = (req, res, next) => {
    const {article_id} = req.params
    fetchArticleById(article_id).then((article) => {
        res.status(200).send({ article })
    }).catch((err) => {
        next(err)
    })
}

exports.getAllArticles = (req, res, next) => {
    const{topic, sort_by, order} = req.query
    if(!topic) {
        fetchAllArticles(topic, sort_by, order).then((articles) => {
            res.status(200).send({ articles })
        }).catch((err) => {
            next(err)
        })
    } else{

        const query1 = fetchAllArticles(topic, sort_by, order)
        const queries = [query1]

        const query2 = checkTopicExists(topic)
        queries.push(query2)

        Promise.all(queries)
        .then((results) => {
            const articles = results[0]
            res.status(200).send({ articles })
        }).catch((err) => {
            next(err)
        })
    }
}

exports.patchArticleVotes = (req, res, next) => {
    const {article_id} = req.params
    const {inc_votes} = req.body

    if (!inc_votes) {
        fetchArticleById(article_id).then((article) => {
            res.status(200).send({article})
        })
    } else {

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
}

exports.postNewArticle = (req, res, next) => {
    const newArticle = req.body

    addNewArticle(newArticle).then((article) => {

        res.status(201).send({article})
    }).catch((err) => {
        next(err)
    })

}