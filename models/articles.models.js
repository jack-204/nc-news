const db = require('../db/connection')
exports.fetchArticleById = (article_id) => {
    const regex = /^[0-9]+$/g
    if(!regex.test(article_id)){
        return Promise.reject({ status: 400, msg: 'Bad request'})
    }

    return db.query(`
    SELECT * FROM articles
    WHERE article_id = $1;
    `, [article_id]).then(({rows}) => {
        if (rows.length === 0){
            return Promise.reject({ status: 404, msg: 'Article not found' })
        }
        return rows[0]
    })
    
    
}