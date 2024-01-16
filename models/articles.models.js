const db = require('../db/connection')

exports.fetchArticleById = (article_id) => {
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

exports.fetchAllArticles = () => {
    return db.query(`
    SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.*) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC;
    `).then(({rows}) => {
        return rows
    })
}


//SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.*) AS c
//omment_count
//FROM articles
//LEFT JOIN comments ON articles.article_id = comments.article_id
//GROUP BY articles.article_id;