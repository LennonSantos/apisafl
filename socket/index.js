var server = require('http').createServer()
var io = require('socket.io')(server)

io.on('connection', (socket) => {
  socket.on('iniciar-votacao', (data) => {
    io.emit('andamento-channel:App\\Events\\VotacaoAndamentoEvent', data)
    console.log(data)
  })

  socket.on('disconnect', () => {
  })
})

// var Redis = require('ioredis')
// var redis = new Redis()

// // redis.subscribe('votacao-channel')
// redis.psubscribe('*') // multiple channels

// // redis.on('message', function (channel, message) {
// redis.on('pmessage', function (subscribed, channel, message) { // multiple channels
//   console.log(channel, message)
//   // 3. Use socket.io to emit to all clients.

//   message = JSON.parse(message)
//   io.emit(channel + ':' + message.event, message.data) // test-channel:UserSignedUp

//   console.log('redis on')
// })

// redis.on('error', err => {
//   console.log(err)
// })

server.listen(6379, '127.0.0.1', function () {
  // server.listen(3000,'10.0.0.23', function(){
  console.log('listening on port 6379')
})
