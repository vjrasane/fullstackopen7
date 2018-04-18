const Blog = require('../models/blog')
const Comment = require('../models/comment')
const User = require('../models/user')

const populate = async (call) => {
  return await call()
      .populate('user', { username: 1, major: 1 })
      .populate('comments', { text: 1 })
}

const getAll = async () => {
  return await populate(() => Blog.find({}))
}

const getById = async (id) => {
  return await populate(() => Blog.findById(id))
}

const save = async (blog) => {
  const saved = await new Blog(blog).save()
  return await populate(() => Blog.findById(saved._id))
}

const update = async (id, blog) => {
  const updated = await Blog.findByIdAndUpdate(id, blog, { new: true })
  return await populate(() => Blog.findById(updated._id))
}

const remove = async (id) => {
  return await Blog.findByIdAndRemove(id)
}

module.exports = {
  getAll, getById, save, update, remove
}
