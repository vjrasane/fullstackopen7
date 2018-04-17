const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const User = require('../models/user')

const initUser = async (user) => {
  const saltRounds = 10
  return new User({
    username: user.username,
    password: await bcrypt.hash(user.password, saltRounds),
    major: user.major ? user.major : true
  })
}

const sign = (user) => {
  return jwt.sign(user, process.env.SECRET)
}

const verify = (token) => {
  return jwt.verify(token, process.env.SECRET)
}

module.exports = {
  initUser, sign, verify
}
