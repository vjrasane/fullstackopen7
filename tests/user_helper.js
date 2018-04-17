const User = require('../models/user')

const retrieveUsers = async () => {
  const users = await User.find({})
  return users
}

module.exports = {
  retrieveUsers
}
