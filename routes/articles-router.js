const articlesRouter = require('express').Router()

const {getArticleById, getAllArticles, patchArticleVotes} = require('../controllers/articles.controllers')
const {getCommentsFromArticle, postCommentToArticle} = require('../controllers/comments.controllers')

articlesRouter.get('/:article_id', getArticleById)

articlesRouter.get('/', getAllArticles)

articlesRouter.get('/:article_id/comments', getCommentsFromArticle)

articlesRouter.post('/:article_id/comments', postCommentToArticle)

articlesRouter.patch('/:article_id', patchArticleVotes)

module.exports = articlesRouter