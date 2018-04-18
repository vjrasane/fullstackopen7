
const blogService = require('../services/blogs')

const emitTimer = (interval, client) => {
    console.log('client is subscribing to timer with interval ', interval);
    setInterval(() => {
      client.emit('timer', new Date());
    }, interval);
}

const emitBlogs = (interval, client) => {
    console.log('client is subscribing to blogs with interval ', interval);
    setInterval(async () => {
      const blogs = JSON.stringify(await blogService.getAll())
      console.log(blogs);
      client.emit('blogs', blogs);
    }, interval);
}

const broadcast = (type, data) => {
  console.log("broadcasting", type, data);
  emitter.emit(type, JSON.stringify(data))
}

const subscriptions = [
  { sub: 'subscribeToTimer', emit: emitTimer },
  { sub: 'pollBlogs', emit: emitBlogs }
]

let emitter
const init = (server) => {
  const io = require('socket.io')(server)

  io.on('connection', (client) => {
    subscriptions.forEach(s => client.on(s.sub, params => s.emit(params, client)))
  });

  emitter = io
}

module.exports = {
  init, broadcast
}
