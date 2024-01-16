const{fetchCommentsFromArticle} = require('../models/comments.models')
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
            return Promise.reject({ status: 404, msg: 'No comments found for this article'})
        }
        res.status(200).send({ comments })
    })
    .catch((err) => {
        next(err)
    })
}