const utils = require('./list_helper.js')
const data = require('./data.js')

test('dummy is called', () => {
  const blogs = []

  const result = utils.dummy(blogs);
  expect(result).toBe(1)
})

describe('total likes', () => {
  test('of empty list is zero', () => {
    const result = utils.totalLikes([])
    expect(result).toBe(0)
  })

  test('of one blog equals the likes of that', () => {
    const result = utils.totalLikes(data.oneBlog)
    expect(result).toBe(data.oneBlog[0].likes)
  })

  test('of many blogs is calculated right', () => {
    const result = utils.totalLikes(data.manyBlogs)
    expect(result).toBe(36)
  })
})

describe('favorite blog', () => {
  test('of empty list is null', () => {
    const result = utils.favoriteBlog([])
    expect(result).toBe(null)
  })

  test('of one blog equals that', () => {
    const result = utils.favoriteBlog(data.oneBlog)
    expect(result).toEqual(data.oneBlog[0])
  })

  test('of many blogs is correct', () => {
    const result = utils.favoriteBlog(data.manyBlogs)
    expect(result).toEqual(data.manyBlogs[2])
  })
})

describe('most blogs', () => {
  test('of empty list is null', () => {
    const result = utils.mostBlogs([])
    expect(result).toBe(null)
  })

  test('of one blog equals that author', () => {
    const result = utils.mostBlogs(data.oneBlog)
    expect(result).toEqual({ author: 'Edsger W. Dijkstra', blogs: 1 })
  })

  test('of many blogs is correct', () => {
    const result = utils.mostBlogs(data.manyBlogs)
    expect(result).toEqual({ author: 'Robert C. Martin', blogs: 3 })
  })
})

describe('most likes', () => {
  test('of empty list is null', () => {
    const result = utils.mostLikes([])
    expect(result).toBe(null)
  })

  test('of one blog equals that author', () => {
    const result = utils.mostLikes(data.oneBlog)
    expect(result).toEqual({ author: 'Edsger W. Dijkstra', likes: 5 })
  })

  test('of many blogs is correct', () => {
    const result = utils.mostLikes(data.manyBlogs)
    expect(result).toEqual({ author: 'Edsger W. Dijkstra', likes: 17 })
  })
})
