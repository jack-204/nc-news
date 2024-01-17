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
        test('400: throws error when given article id that doesnt exist', () => {
            return request(app).get('/api/articles/4000/comments')
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad request')
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
                expect(typeof comment.body).toBe('string')
                expect(typeof comment.article_id).toBe('number')
                expect(typeof comment.author).toBe('string')
                expect(typeof comment.votes).toBe('number')
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
        test('400: patch fails if given wrong key', () => {
            const input = {
                title : 'new title'
            }
            return request(app).patch('/api/articles/1').send(input)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad request')
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
        test('400: patch fails if given id that does not refer to an article', () => {
            const input = {
                inc_votes : 1 
            }
            return request(app).patch('/api/articles/20000').send(input)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad request')
            })
        })
    })
})
