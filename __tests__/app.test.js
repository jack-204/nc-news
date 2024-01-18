const request = require('supertest')
const app = require('../app')
const db = require('../db/connection')
const seed = require('../db/seeds/seed')
const data = require('../db/data/test-data/index')
const fs = require('fs/promises')
require('jest-sorted')

beforeEach(() => {
    return seed(data)
})

afterAll(() => {
    return db.end()
})

describe('app.js', () => {
    describe('GET invalid endpoint', () => {
        test('404: responds with error when given a path that has no endpoint', () => {
            return request(app).get('/api/nonsense')
            .expect(404)
        })
    })

    describe('GET /api/topics', () => {
        test('200: responds with an array of topic objects', () => {
            return request(app).get('/api/topics')
            .expect(200)
            .then(({body}) =>{
                const {topics} = body
                //if the array is empty, the test fails
                expect(topics.length > 0).toBe(true)
                topics.forEach((topic) => {
                    //test property name and data type of value
                    expect(topic.hasOwnProperty('slug')).toBe(true)
                    expect(typeof topic.slug).toBe('string')
                    expect(topic.hasOwnProperty('description')).toBe(true)
                    expect(typeof topic.description).toBe('string')
                })
            })
        })
    })

    describe('GET /api', () => {
        test('200: responds with an object of endpoints', () => {
            return request(app).get('/api')
            .expect(200)
            .then(({body}) => {
                
                const file =  fs.readFile('./endpoints.json', 'utf-8')
                return Promise.all([file, body])
            })
            .then((contents) => {
                const file = JSON.parse(contents[0])
                const body = contents[1].endpoints
                expect(body).toEqual(file)
            })
        })
    })

    describe('GET /api/articles/:article_id', () => {
        test('200: responds with the article object requested', () => {
            return request(app).get('/api/articles/1')
            .expect(200)
            .then(({body}) => {
                const {article} = body
                expect(article).toMatchObject(
                    {
                        article_id: 1,
                        title: "Living in the shadow of a great man",
                        topic: "mitch",
                        author: "butter_bridge",
                        body: "I find this existence challenging",
                        created_at: '2020-07-09T20:11:00.000Z',  //converting the unicode time was 1 hour wrong (daylight savings time?)
                        votes: 100,
                        article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                    }
                )
            })
        })
        test('404: responds with an error when requested article is not found within database', () => {
            return request(app).get('/api/articles/10000')
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe('Article not found')
            })
        })
        test('400: responds with an error when requested with a bad input', () => {
            return request(app).get('/api/articles/nonsense')
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad request')
            })
        })
    })

    describe('GET /api/articles', () => {
        test('200: responds with all articles', () => {
            return request(app).get('/api/articles')
            .expect(200)
            .then(({body}) => {
                const {articles} = body
                expect(articles.length > 0).toBe(true)
                articles.forEach((article) => {
                    expect(typeof article.author).toBe('string')
                    expect(typeof article.title).toBe('string')
                    expect(typeof article.article_id).toBe('number')
                    expect(typeof article.topic).toBe('string')
                    expect(typeof article.created_at).toBe('string')
                    expect(typeof article.votes).toBe('number')
                    expect(typeof article.article_img_url).toBe('string')
                    expect(typeof article.comment_count).toBe('string')
                    expect(article.hasOwnProperty('body')).toBe(false)
                })
            })
        })
        test('200: articles are sorted by date in descending order', () => {
            return request(app).get('/api/articles')
            .then(({body}) => {
                const {articles} = body
                expect(articles).toBeSorted({ key: 'created_at', descending: true})
            })
        })
    })

    describe('GET /api/articles/:article_id/comments', () => {
        test('200: responds with an array of comments with the right properties', () => {
            return request(app).get('/api/articles/1/comments')
            .expect(200)
            .then(({body}) => {
                const {comments} = body
                comments.forEach((comment) => {
                    expect(typeof comment.comment_id).toBe('number')
                    expect(typeof comment.votes).toBe('number')
                    expect(typeof comment.created_at).toBe('string')
                    expect(typeof comment.author).toBe('string')
                    expect(typeof comment.body).toBe('string')
                    expect(typeof comment.article_id).toBe('number')
                })
            })
        })
        test('200: response is ordered by with the most recent comments first', () => {
            return request(app).get('/api/articles/1/comments')
            .expect(200)
            .then(({body}) => {
                const {comments} = body
                expect(comments).toBeSorted({ key: 'created_at', ascending: true})
            })
        })
        test('200: response has the correct data', () => {
            return request(app).get('/api/articles/9/comments')
            .expect(200)
            .then(({body}) => {
                const {comments} = body
                const testedComment = comments[1]
                expect(testedComment).toMatchObject({
                    comment_id: 1,
                    votes: 16,
                    author: 'butter_bridge',
                    article_id: 9,
                    created_at: '2020-04-06T12:17:00.000Z',
                })

            })
        })
        test('400: throws error if given invalid input', () => {
            return request(app).get('/api/articles/nonsense/comments')
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad request')
            })
        })
        test('200: gives an empty array when no comments found at article', () => {
            return request(app).get('/api/articles/2/comments')
            .expect(200)
            .then(({body}) => {
                expect(body.comments).toEqual([])
            })
        })
        test('404: throws error when given article id that doesnt exist', () => {
            return request(app).get('/api/articles/4000/comments')
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe('Article requested not found')
            })
        })
    })

    describe('POST /api/articles/:article_id/comments', () => {
        test('201: adds an item into the comments table with the correct keys', () => {
            const input = {
                username: 'lurker',
                body: 'example body'
            }
            return request(app).post('/api/articles/1/comments').send(input)
            .expect(201)
            .then(({body}) => {
                const {comment} = body
                expect(typeof comment.comment_id).toBe('number')
                expect(comment.body).toBe('example body')
                expect(comment.article_id).toBe(1)
                expect(comment.author).toBe('lurker')
                expect(comment.votes).toBe(0)
                expect(typeof comment.created_at).toBe('string')
            })
        })
        test('400: responds with an error if not provided with a body', () => {
            const input = {
                username: 'lurker'
            }
            return request(app).post('/api/articles/1/comments').send(input)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad request')
            })
        })
        test('400: resonds with an error if not given a valid username', () => {
            const input = {
                username: 'example',
                body: 'example body'
            }
            return request(app).post('/api/articles/1/comments').send(input)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad request')
            })
        })
        test('400: responds with an error if given an invalid article_id in the path', () => {
            const input = {
                username: 'lurker',
                body: 'example'
            }
            return request(app).post('/api/articles/nonsense/comments').send(input)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad request')
            })
        })
        test('400: responds with an error if given an article id that doesnt exist', () => {
            const input = {
                username: 'lurker',
                body: 'example'
            }
            return request(app).post('/api/articles/40000/comments').send(input)
            .then(({body}) => {
                expect(body.msg).toBe('Bad request')
            })
        })
    })
    describe('PATCH /api/articles/:article_id', () => {
        test('200: patch increases the votes on the requested article', () => {
            const input = {
                inc_votes : 1 
            }
            return request(app).patch('/api/articles/1').send(input)
            .expect(200)
            .then(({body}) => {
                const {article} = body
                expect(article.votes).toBe(101)
            })
        })
        test('200: patch decreases the votes on the requested article', () => {
            const input = {
                inc_votes : -99
            }
            return request(app).patch('/api/articles/1').send(input)
            .then(({body}) => {
                const {article} = body
                expect(article.votes).toBe(1)
            })
        })
        test('200: returns unpatched array if given wrong key', () => {
            const input = {
                title : 'new title'
            }
            return request(app).patch('/api/articles/1').send(input)
            .expect(200)
            .then(({body}) => {
                const {article} = body
                const expected = {
                    article_id: 1,
                    title: "Living in the shadow of a great man",
                    topic: "mitch",
                    author: "butter_bridge",
                    body: "I find this existence challenging",
                    created_at: "2020-07-09T20:11:00.000Z",
                    votes: 100,
                    article_img_url:"https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                    
                }
                expect(article).toMatchObject(expected)
            })
        })
        test('400: patch fails if given wrong data', () => {
            const input = {
                inc_votes : 'test'
            }
            return request(app).patch('/api/articles/1').send(input)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad request')
            })
        })
        test('404: patch fails if given id that does not refer to an article', () => {
            const input = {
                inc_votes : 1 
            }
            return request(app).patch('/api/articles/20000').send(input)
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe('Article requested not found')
            })
        })
        test('200: if inc_votes is missing, original article is returned and is not updated', () => {
            return request(app).patch('/api/articles/1').send({})
            .expect(200)
            .then(({body}) => {
                const {article} = body
                const expected = {
                    article_id: 1,
                    title: "Living in the shadow of a great man",
                    topic: "mitch",
                    author: "butter_bridge",
                    body: "I find this existence challenging",
                    created_at: "2020-07-09T20:11:00.000Z",
                    votes: 100,
                    article_img_url:"https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                }
                expect(article).toMatchObject(expected)
            })
        })
    })

    describe('DELETE /api/comments/:comment_id', () => {
        test('204: succesfully deletes item by id', () => {
            return request(app).delete('/api/comments/1')
            .expect(204)
            .then(() => {
                return db.query('SELECT * FROM comments WHERE comment_id = 1;')
            }).then(({rows}) => {
                expect(rows).toEqual([])
            })
        })
        test('404: fails if comment id is not found', () => {
            return request(app).delete('/api/comments/40000')
            .expect(404)
            .then(({body})=> {
                expect(body.msg).toBe('Not found')
            })
        })
        test('400: fails if comment_id is not valid', () => {
            return request(app).delete('/api/comments/abc')
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad request')
            })
        })
    })

    describe('GET /api/users', () => {
        test('200: get users gets an array of user objects', () => {
            return request(app).get('/api/users')
            .expect(200)
            .then(({body}) => {
                const {users} = body
                expect(users.length > 0).toBe(true)
                users.forEach((user) => {
                    expect(typeof user.username).toBe('string')
                    expect(typeof user.name).toBe('string')
                    expect(typeof user.avatar_url).toBe('string')
                })
            })
        })
    })

    describe('GET /api/articles?topic=mitch', () => {
        test('200: articles returned are filtered by topic', () => {
            return request(app).get('/api/articles?topic=mitch')
            .expect(200)
            .then(({body}) => {
                const {articles} = body
                articles.forEach((article) => {
                    expect(article.topic).toBe('mitch')
                })
            })
        })
        test('404: no articles exist with given topic', () => {
            return request(app).get('/api/articles?topic=nonsense')
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe('Not found')
            })
        })
        test('200: returns all articles like previous endpoint for queries other than topic', () => {
            return request(app).get('/api/articles?nonsense=something')
            .expect(200)
            .then(({body}) => {
                const {articles} = body
                expect(articles.length).toBe(13)
            })
        })
    })

    describe('GET /api/articles/:article_id', () => {
        test('200: responds with a full array even if there are 0 comments on the article', () => {
            return request(app).get('/api/articles/2')
            .expect(200)
            .then(({body}) => {
                const {article} = body
                expect(article).toEqual({
                    article_id: 2,
                    title: "Sony Vaio; or, The Laptop",
                    topic: "mitch",
                    author: "icellusedkars",
                    body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
                    created_at: "2020-10-16T05:03:00.000Z",
                    article_img_url:"https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                    votes: 0,
                    comment_count: '0'
                })
            })
        })
        test('200: responds with the article with the comment count for an article with comments', () => {
            return request(app).get('/api/articles/1')
            .expect(200)
            .then(({body}) => {
                const {article} = body
                expect(article).toEqual({
                    article_id: 1,
                    title: "Living in the shadow of a great man",
                    topic: "mitch",
                    author: "butter_bridge",
                    body: "I find this existence challenging",
                    created_at: "2020-07-09T20:11:00.000Z",
                    votes: 100,
                    article_img_url:"https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                    comment_count: '11'
                })
            })
        })
    })
})
