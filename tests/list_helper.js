const dummy = (blogs) => { // eslint-disable-line no-unused-vars
  return 1;
}

const totalLikes = (blogs) => {
  return blogs.map(b => b.likes).reduce((a,b) => a + b, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((a,b) => a && a.likes >= b.likes ? a : b, null)
}

const authorBlogs = (blogs) => {
  // lol
  return blogs.map(b => b.author)
    .filter((a,i,arr) => arr.indexOf(a) === i) // filtteröi duplikaatit
    .map(a => {
      return {
        'author' : a,
        'blogs' : blogs.filter(b => b.author === a)
      }
    })
}

const mostBlogs = (blogs) => {
  return authorBlogs(blogs).map(a => {
    return {
      'author' : a.author,
      'blogs' : a.blogs.length
    }
  }).reduce((a,b) => a && a.blogs >= b.blogs ? a : b, null)
}

const mostLikes = (blogs) => {
  return authorBlogs(blogs).map(a => {
    return {
      'author' : a.author,
      'likes' : totalLikes(a.blogs)
    }
  }).reduce((a,b) => a && a.likes >= b.likes ? a : b, null)
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
