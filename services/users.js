const User = require('../models/user')

const populate = async (call) => {
  return await call()
      .populate('blogs', { title: 1, author: 1, url: 1, likes: 1 })
}

const getAll = async () => {
  return (await populate(() => User.find({}))).map(User.format)
}

const getById = async (id) => {
  return User.format(await populate(() => User.findById(id)))
}

const save = async (user) => {
  const saved = await new User(user).save()
  return User.format(await populate(() => User.findById(saved._id)))
}

const update = async (id, user) => {
  const updated = await User.findByIdAndUpdate(id, user, { new: true })
  return User.format(await populate(() => User.findById(updated._id)))
}

const remove = async (id) => {
  return await User.format(User.findByIdAndRemove(id))
}

module.exports = {
  getAll, getById, save, update, remove
}
