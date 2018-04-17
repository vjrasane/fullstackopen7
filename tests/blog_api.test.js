const utils = require('./blog_helper')
const Blog = require('../models/blog')
const User = require('../models/user')
const data = require('./data')
const security = require('../utils/security')

const { app, server } = require('../index')
const supertest = require('supertest')
const api = supertest(app)

describe('when some blogs already exist', async () => {
  let authHeaders
  let blogUser
  beforeAll(async () => {
    await Blog.remove({})
    await User.remove({})

    blogUser = await security.initUser({
      username: 'Teppo Testaaja',
      password: 'passu',
      major: 1
    })
    blogUser = await blogUser.save()

    const token = security.sign({ username: blogUser.username, id: blogUser._id })
    authHeaders = { 'Authorization' : `Bearer ${token}` }

    const blogObjs = data.manyBlogs.map(b => new Blog(b))
    const promises /*! and they still feel oh so wasted on myself  */
       = blogObjs.map(b => b.save())
    await Promise.all(promises)
  })

  test('returns all blogs as json', async () => {
    const dbBlogs = await utils.retrieveBlogs()

    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.length).toBe(data.manyBlogs.length)

    const titles = response.body.map(b => b.title)
    dbBlogs.forEach(b => {
      expect(titles).toContain(b.title)
    })
  })

  describe('addition of a new blog', async () => {
    test('succeeds with valid data', async () => {
      const initialBlogs = await utils.retrieveBlogs()

      const newBlog = {
        title: 'New added blog',
        author: 'Teppo Testaaja',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        likes: 0
      }

      await api
        .post('/api/blogs')
        .set(authHeaders)
        .send(newBlog)
        .expect(201)

      const afterBlogs = await utils.retrieveBlogs()

      expect(afterBlogs.length).toBe(initialBlogs.length + 1)
      const titles = afterBlogs.map(b => b.title)
      expect(titles).toContain(newBlog.title)
    })

    test('have zero inital likes', async () => {
      const newBlog = {
        title: 'New unique blog name',
        author: 'Teppo Testaaja',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        // likes: 0
      }

      const added = await api
        .post('/api/blogs')
        .set(authHeaders)
        .send(newBlog)
        .expect(201)

      expect(added.body.likes).toBe(0)
    })

    test('missing fields', async () => {
      const initialBlogs = await utils.retrieveBlogs()

      await api
        .post('/api/blogs')
        .set(authHeaders)
        .send({})
        .expect(400)

      const afterBlogs = await utils.retrieveBlogs()

      expect(afterBlogs.length).toBe(initialBlogs.length)
    })
  })

  describe('deletion of a blog', async () => {
    let addedBlog
    let initialBlogs

    beforeAll(async () => {
      initialBlogs = await utils.retrieveBlogs()
      addedBlog = new Blog({
        title: 'Delete this',
        author: 'Teppo Testaaja',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        likes: 0,
        user: blogUser._id
      })
      addedBlog = await addedBlog.save()
    })

    test('successfully removed', async () => {
      const beforeBlogs = await utils.retrieveBlogs()
      console.log(authHeaders)
      await api
        .delete(`/api/blogs/${addedBlog._id}`)
        .set(authHeaders)
        .expect(204)

      const afterBlogs = await utils.retrieveBlogs()
      const titles = afterBlogs.map(b => b.title)

      expect(afterBlogs.length).toBe(beforeBlogs.length - 1)
      expect(titles).not.toContain(addedBlog.title)
      initialBlogs.forEach(b => {
        expect(titles).toContain(b.title)
      })
    })

    test('inexistent id', async () => {
      const beforeBlogs = await utils.retrieveBlogs()

      await api
        .delete('/api/blogs/inexistent')
        .set(authHeaders)
        .expect(500)

      const afterBlogs = await utils.retrieveBlogs()
      const titles = afterBlogs.map(b => b.title)

      expect(afterBlogs.length).toBe(beforeBlogs.length)
      beforeBlogs.forEach(b => {
        expect(titles).toContain(b.title)
      })
    })
  })

  describe('modifying a blog', async () => {
    let addedBlog
    let initialBlogs

    beforeAll(async () => {
      initialBlogs = await utils.retrieveBlogs()
      addedBlog = new Blog({
        title: 'Modify this',
        author: 'Teppo Testaaja',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        likes: 0,
        user: blogUser._id
      })
      await addedBlog.save()
    })

    test('successfully modified', async () => {
      const beforeBlogs = await utils.retrieveBlogs()

      const modifiedBlog = {
        title: 'This has been modified',
        author: 'Teppo Testaajan Poika',
        url: 'https://www.youtube.com/watch?v=oavMtUWDBTM',
        likes: 42
      }

      await api
        .put(`/api/blogs/${addedBlog._id}`)
        .set(authHeaders)
        .send(modifiedBlog)
        .expect(200)

      const afterBlogs = await utils.retrieveBlogs()
      const titles = afterBlogs.map(b => b.title)

      // tähän on varmaan joku kivempi tapa
      const modifiedInDb = await Blog.findOne({ 'title' : modifiedBlog.title })
      expect(modifiedInDb.title).toBe(modifiedBlog.title)
      expect(modifiedInDb.author).toBe(modifiedBlog.author)
      expect(modifiedInDb.url).toBe(modifiedBlog.url)
      expect(modifiedInDb.likes).toBe(modifiedBlog.likes)

      expect(afterBlogs.length).toBe(beforeBlogs.length)

      expect(titles).toContain(modifiedBlog.title)
      expect(titles).not.toContain(addedBlog.title)
      initialBlogs.forEach(b => {
        expect(titles).toContain(b.title)
      })
    })

    test('inexistent id', async () => {
      const beforeBlogs = await utils.retrieveBlogs()

      const modifiedBlog = {
        title: 'This has been modified',
        author: 'Teppo Testaajan Poika',
        url: 'https://www.youtube.com/watch?v=oavMtUWDBTM',
        likes: 42
      }

      await api
        .put('/api/blogs/inexistent')
        .set(authHeaders)
        .send(modifiedBlog)
        .expect(500)

      const afterBlogs = await utils.retrieveBlogs()
      const titles = afterBlogs.map(b => b.title)

      expect(afterBlogs.length).toBe(beforeBlogs.length)
      beforeBlogs.forEach(b => {
        expect(titles).toContain(b.title)
      })
    })

    test('missing fields', async () => {
      const beforeBlogs = await utils.retrieveBlogs()

      await api
        .put(`/api/blogs/${addedBlog._id}`)
        .set(authHeaders)
        .send({})
        .expect(400)

      const afterBlogs = await utils.retrieveBlogs()
      const titles = afterBlogs.map(b => b.title)

      expect(afterBlogs.length).toBe(beforeBlogs.length)
      beforeBlogs.forEach(b => {
        expect(titles).toContain(b.title)
      })
    })
  })
})

afterAll(async () => {
  await Blog.remove({})
  await User.remove({})
  server.close()
})
