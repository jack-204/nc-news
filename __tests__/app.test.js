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
                    expect(article.hasOwnProperty('author')).toBe(true)
                    expect(typeof article.author).toBe('string')

                    expect(article.hasOwnProperty('title')).toBe(true)
                    expect(typeof article.title).toBe('string')

                    expect(article.hasOwnProperty('article_id')).toBe(true)
                    expect(typeof article.article_id).toBe('number')

                    expect(article.hasOwnProperty('topic')).toBe(true)
                    expect(typeof article.topic).toBe('string')

                    expect(article.hasOwnProperty('created_at')).toBe(true)
                    expect(typeof article.created_at).toBe('string')

                    expect(article.hasOwnProperty('votes')).toBe(true)
                    expect(typeof article.votes).toBe('number')

                    expect(article.hasOwnProperty('article_img_url')).toBe(true)
                    expect(typeof article.article_img_url).toBe('string')

                    expect(article.hasOwnProperty('comment_count')).toBe(true)
                    expect(article.hasOwnProperty('body')).toBe(false)
                })
            })
        })
        test('200: articles are sorted by date in descending order', () => {
            return request(app).get('/api/articles')
            .expect(200)
            .then(({body}) => {
                const {articles} = body
                expect(articles).toBeSorted({ key: 'created_at', descending: true})
            })
        })
    })
})
