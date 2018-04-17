const bcrypt = require('bcryptjs')
const loginRouter = require('express').Router()
const User = require('../models/user')
const security = require('../utils/security')

loginRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findOne({ username: body.username })
  const passwordCorrect = user === null ?
    false :
    await bcrypt.compare(body.password, user.password)

  if ( !(user && passwordCorrect) ) {
    return response.status(401).send({ error: 'invalid username or password' })
  }

  const userForToken = {
    username: user.username,
    id: user._id
  }

  const token = security.sign(userForToken)

  response.status(200).send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter
