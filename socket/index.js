var server = require('http').createServer()
var io = require('socket.io')(server)

let tema = {}
let votos = []
let resultadoVotos = []

io.on('connection', socket => {
  // canal para iniciar votação
  socket.on('iniciar-votacao', data => {
    tema = data // carrega o tema atual
    votos = [] // zera os votos
    io.emit('andamento-channel:App\\Events\\VotacaoAndamentoEvent', data)
    io.emit('votos', {sim: 0, nao: 0, abstenho: 0})
  })

  socket.on('finalizar-votacao', () => {
    tema.status_votacao = 2
    tema.quantidade_sim = resultadoVotos.sim
    tema.quantidade_nao = resultadoVotos.nao
    tema.quantidade_abstensao = resultadoVotos.abstenho

    io.emit('tema', tema)
    // emite um evento para atualizar os dados
    io.emit('atualizar', true)
  })

  socket.on('voto', data => {
    if (tema.status_votacao === 1) {
      votos.push(data)

      resultadoVotos = {
        sim: votos.filter(el => el.voto === 'SIM').length,
        nao: votos.filter(el => el.voto === 'NAO').length,
        abstenho: votos.filter(el => el.voto === 'ABSTENHO').length
      }

      io.emit('votos', resultadoVotos)
    }
  })

  socket.on('start', () => {
    tema.hora_atual = new Date()
    io.emit('tema', tema)
    io.emit('votos', resultadoVotos)
  })

  // console.log(tema)

  // ouve o user desconectado
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
