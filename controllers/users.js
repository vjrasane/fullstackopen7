const usersRouter = require('express').Router()
const User = require('../models/user')

const security = require('../utils/security')

usersRouter.post('/', async (request, response) => {
  try {
    const body = request.body
    if(!body.username || !body.password)
      return response.status(400).json({ error: 'missing fields' })

    const existingUser = await User.findOne({ username: body.username })
    if (existingUser) {
      return response.status(400).json({ error: 'username must be unique' })
    }
    if(body.password.length < 3)
      return response.status(400).json({ error: 'password must be at least 3 characters long' })

    const user = await security.initUser(body)

    const savedUser = await user.save()

    response.status(201).json(User.format(savedUser))
  } catch (exception) {
    console.log(exception)
    response.status(500).json({ error: 'something went wrong...' })
  }
})


usersRouter.get('/', async (request, response) => {
  const users =
    await User.find({})
      .populate('blogs', { title: 1, author: 1, url: 1, likes: 1 })
  response.json(users.map(User.format))
})

module.exports = usersRouter
