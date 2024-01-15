const request = require('supertest')
const app = require('../app')
const db = require('../db/connection')
const seed = require('../db/seeds/seed')
const data = require('../db/data/test-data/index')
const fs = require('fs/promises')

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
})
