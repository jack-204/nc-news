const{fetchCommentsFromArticle, addCommentToArticle, removeCommentById, updateCommentVotes} = require('../models/comments.models')
const{checkArticleExists} = require('../utils/check-exists')

exports.getCommentsFromArticle = (req, res, next) => {
    const{article_id} = req.params
    const q1 = fetchCommentsFromArticle(article_id)
    const queries = [q1]

    const q2 = checkArticleExists(article_id)
    queries.push(q2)
    Promise.all(queries)

    .then((response) => {
        const comments = response[0]
        if (comments.length === 0) {
            //this logic would be in the model if it wasnt for the fact I was getting async problems
            res.status(200).send({comments: []})
        }
        res.status(200).send({ comments })
    })
    .catch((err) => {
        next(err)
    })
}

exports.postCommentToArticle = (req, res, next) => {
    const {article_id} = req.params
    const newComment = req.body
    
    addCommentToArticle(article_id, newComment).then((comment) => {
        res.status(201).send({ comment })
    })
    .catch((err) => {
        next(err)
    })
}

exports.deleteCommentById = (req, res, next) => {
    const {comment_id} = req.params

    removeCommentById(comment_id).then(()=>{
        res.status(204).send()
    }).catch((err) => {
        next(err)
    })
}

exports.patchCommentVotes = (req, res, next) => {
    const {comment_id} = req.params
    const {inc_votes} = req.body
    
    updateCommentVotes(comment_id, inc_votes).then((comment) => {
        res.status(200).send({comment})
    }).catch((err) => {
        next(err)
    })
}