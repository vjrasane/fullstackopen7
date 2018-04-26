
const User = require('../models/user')

const userService = require('../services/users')

const security = require('../utils/security')

module.exports = (sockets) => {
  const usersRouter = require('express').Router()
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

      const saved = await userService.save(user)

      response.status(201).json(saved)
      sockets.broadcast('user.create', saved)
    } catch (exception) {
      console.log(exception)
      response.status(500).json({ error: 'something went wrong...' })
    }
  })

  usersRouter.get('/', async (request, response) => {
    console.log("get users");
    const users = await userService.getAll()
    console.log(users);
    response.json(users)
  })

  return usersRouter
}
