const db = require('../db/connection')

exports.fetchCommentsFromArticle = (article_id) => {
    return db.query(`
    SELECT * FROM comments
    WHERE article_id = $1
    ORDER BY created_at ASC;`, [article_id])
    .then(({rows}) => {

        return rows
    })
}

exports.addCommentToArticle = (article_id, newComment) => {
    return db.query(`
    INSERT INTO comments
    (body, article_id, author)
    VALUES ($1, $2, $3) RETURNING *`, [newComment.body, article_id, newComment.username])
    .then(({rows}) => {
        return rows[0]
    })
}

exports.removeCommentById = (comment_id) => {
    return db.query(`
    DELETE FROM comments
    WHERE comment_id = $1 RETURNING *`, [comment_id])
    .then(({rows}) => {
        if (rows.length === 0){
            return Promise.reject({ status: 404, msg: 'Not found'})
        }
    })
}

exports.updateCommentVotes = (comment_id, inc_votes = 0) => {
    return db.query(`
    UPDATE comments
    SET votes = votes + $1
    WHERE comment_id = $2
    RETURNING *;`, [inc_votes, comment_id]).then(({rows}) => {
        if(rows.length === 0) {
            return Promise.reject({status: 404, msg: 'Comment not found'})
        }
        return rows[0]
    })
}