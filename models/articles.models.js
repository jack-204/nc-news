const db = require('../db/connection')

exports.fetchArticleById = (article_id) => {
    return db.query(`
    SELECT articles.*, COUNT(comments.*) AS comment_count 
    FROM articles FULL JOIN comments ON articles.article_id = comments.article_id 
    WHERE articles.article_id = $1 GROUP BY articles.article_id;
    `, [article_id]).then(({rows}) => {
        if (rows.length === 0){
            return Promise.reject({ status: 404, msg: 'Article not found' })
        }
        return rows[0]
    })
    
    
}

exports.fetchAllArticles = (topic = undefined, sort_by = 'created_at', order = 'desc') => {
    const isSortByValid = sort_by === 'article_id' || sort_by === 'title' || sort_by === 'topic' || sort_by === 'author' || sort_by === 'body' || sort_by === 'created_at' || sort_by === 'votes' || sort_by === 'article_img_url' ? true : false
    const isOrderValid = order === 'asc' || order === 'desc' ? true : false
    const sqlQueryArray = [`
    SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.*) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id 
    `, `
     GROUP BY articles.article_id
    ORDER BY articles.${sort_by} ${order.toUpperCase()};`]

    if(topic){
        sqlQueryArray.splice(1, 0, `WHERE topic = '${topic}'`)
    }
    if (isSortByValid && isOrderValid){
        const sqlQuery = sqlQueryArray.join(` `)
        return db.query(sqlQuery).then(({rows}) => {
            return rows
        })
    } else {
        return Promise.reject({status: 400, msg: 'Bad request'})
    }
}

exports.updateArticleVotes = (article_id, inc_votes) => {
    return db.query(`
    UPDATE articles 
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *;
    `, [inc_votes, article_id]).then(({rows}) => {
        return rows[0]
    })
}
