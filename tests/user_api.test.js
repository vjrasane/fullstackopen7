const User = require('../models/user')
const utils = require('./user_helper')

const { app, server } = require('../index')
const supertest = require('supertest')
const api = supertest(app)

describe('when there is initially one user at db', async () => {
  beforeAll(async () => {
    await User.remove({})
    const user = new User({ username: 'root', password: 'sekret' })
    await user.save()
  })

  test('POST /api/users succeeds with a fresh username', async () => {
    const usersBeforeOperation = await utils.retrieveUsers()

    const newUser = {
      username: 'mluukkai',
      password: 'salainen',
      major: true
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAfterOperation = await utils.retrieveUsers()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length + 1)
    const usernames = usersAfterOperation.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('POST /api/users succeeds and defaults major value to true', async () => {
    const usersBeforeOperation = await utils.retrieveUsers()
    const newUser = {
      username: 'major',
      password: 'salainen'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(result.body.major).toBe(true)
    const usersAfterOperation = await utils.retrieveUsers()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length + 1)
    const usernames = usersAfterOperation.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('POST /api/users fails with proper statuscode and message if username already taken', async () => {
    const usersBeforeOperation = await utils.retrieveUsers()

    const newUser = {
      username: 'root',
      password: 'salainen',
      major: true
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual({ error: 'username must be unique' })

    const usersAfterOperation = await utils.retrieveUsers()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
  })

  test('POST /api/users fails with proper statuscode and message if password is too short', async () => {
    const usersBeforeOperation = await utils.retrieveUsers()

    const newUser = {
      username: 'uusi',
      password: '12',
      major: true
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual({ error: 'password must be at least 3 characters long' })

    const usersAfterOperation = await utils.retrieveUsers()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
  })

  test('POST /api/users fails with proper statuscode and message if missing fields', async () => {
    const usersBeforeOperation = await utils.retrieveUsers()

    const result = await api
      .post('/api/users')
      .send({})
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual({ error: 'missing fields' })

    const usersAfterOperation = await utils.retrieveUsers()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
  })
})

afterAll(async () => {
  await User.remove({})
  server.close()
})
