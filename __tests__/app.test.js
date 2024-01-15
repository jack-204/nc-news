const request = require('supertest')
const app = require('../app')
const db = require('../db/connection')
const seed = require('../db/seeds/seed')
const data = require('../db/data/test-data/index')

beforeEach(() => {
    return seed(data)
})

afterAll(() => {
    return db.end()
})

describe('app.js', () => {
    describe('GET /api/topics', () => {
        test('200: responds with an array of topic objects', () => {
            return request(app).get('/api/topics')
            .expect(200)
            .then(({body}) =>{
                const {topics} = body
                topics.forEach((topic) => {
                    expect(topic.hasOwnProperty('slug')).toBe(true)
                    expect(topic.hasOwnProperty('description')).toBe(true)
                })
            })
        })
    })
})
