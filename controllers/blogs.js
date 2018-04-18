
const Blog = require('../models/blog')
const Comment = require('../models/comment')
const User = require('../models/user')

const blogService = require('../services/blogs')

module.exports = (sockets) => {
  const blogRouter = require('express').Router()
  blogRouter.get('/', async (req, res) => {
    try {
      res.json(await blogService.getAll())
    } catch(ex) {
      console.log(ex)
      res.status(500).json({ error: ex })
    }
  })

  blogRouter.get('/:id', async (req, res) => {
    try {
      res.json(await blogService.getById(req.params.id))
    } catch(ex) {
      console.log(ex)
      res.status(500).json({ error: ex })
    }
  })

  blogRouter.post('/', async (req, res) => {
    const body = req.body
    try {
      console.log(req.token);
      if (!req.token || !req.token.id) {
        return res.status(401).json({ error: 'token missing or invalid' })
      }

      if(!body.title ||
        !body.url ||
        !body.author)
        return res.status(400).json({ error: 'missing fields' })

      const user = await User.findById(req.token.id)
      if(!user)
        return res.status(400).json({ error: 'inexistent user' })

      const blog = body
      blog.user = user._id
      blog.likes = body.likes ? body.likes : 0

      const saved = await blogService.save(blog)

      user.blogs = user.blogs.concat(saved._id)
      await user.save()

      res.status(201).json(saved)
      sockets.broadcast('blog.create', saved)
    } catch(ex) {
      if (ex.name === 'JsonWebTokenError' ) {
        res.status(401).json({ error: ex.message })
      } else {
        console.log(ex)
        res.status(500).json({ error: 'something went wrong...' })
      }
    }
  })

  blogRouter.post('/:id/comments', async (req, res) => {
    const body = req.body
    try {
      console.log("comment", body);
      if (!req.token || !req.token.id) {
        return res.status(401).json({ error: 'token missing or invalid' })
      }

      console.log("comment", req.token);

      if(!body.text)
        return res.status(400).json({ error: 'missing fields' })

      const blog = await Blog.findById(req.params.id)

      console.log("comment", blog);
      if(!blog)
        return res.status(400).json({ error: 'nonexistent blog' })

      const comment = new Comment(body)

      const saved = await comment.save()
      blog.comments = blog.comments.concat(saved._id)
      const updated = await blogService.update(req.params.id, blog)

      res.status(201).json(saved)
      sockets.broadcast('blog.update', updated)
    } catch(ex) {
      if (ex.name === 'JsonWebTokenError' ) {
        res.status(401).json({ error: ex.message })
      } else {
        console.log(ex)
        res.status(500).json({ error: 'something went wrong...' })
      }
    }
  })

  blogRouter.delete('/:id', async (req, res) => {
    try {
      if (!req.token || !req.token.id) {
        return res.status(401).json({ error: 'token missing or invalid' })
      }

      const blog = await Blog.findById(req.params.id)
      if(!blog)
        return res.status(400).json({ error: 'inexistent blog' })

      if(blog.user && blog.user.toString() !== req.token.id)
        return res.status(401).json({ error: 'cannot remove another user\'s blog' })

      const removed = await blogService.remove(req.params.id)

      res.status(204).end();
      sockets.broadcast('blog.remove', removed)
    } catch(ex) {
      console.log(ex)
      res.status(500).json({ error: ex })
    }
  })

  blogRouter.put('/:id', async (req, res) => {
    try {
      if(req.body.title === undefined
        || req.body.url === undefined
        || req.body.author === undefined)
        return res.status(400).json({ error: 'missing fields' })

      const updated = await blogService.update(req.params.id, req.body)

      res.json(updated)
      sockets.broadcast('blog.update', updated)
    } catch(ex) {
      console.log(ex)
      res.status(500).json({ error: ex })
    }
  })

  return blogRouter
}
