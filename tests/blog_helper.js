const Blog = require('../models/blog')

const retrieveBlogs = async () => {
  return await Blog.find({})
}

module.exports = {
  retrieveBlogs
}
