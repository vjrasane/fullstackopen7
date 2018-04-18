const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  major: Boolean,
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }]
})

userSchema.statics.format = (user) => {
  return {
    _id: user._id,
    name: user.username,
    major: user.major,
    blogs: user.blogs
  }
}

const User = mongoose.model('User', userSchema)

module.exports = User
