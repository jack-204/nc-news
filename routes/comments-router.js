const commentsRouter = require('express').Router()

const {deleteCommentById, patchCommentVotes} = require('../controllers/comments.controllers')

commentsRouter.delete('/:comment_id', deleteCommentById)

commentsRouter.patch('/:comment_id', patchCommentVotes)

module.exports = commentsRouter