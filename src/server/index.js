
const restify = require('restify')
const server = restify.createServer()
const routes = require('../http/routes')
const cors = require('./cors')
// const jwtMiddleware = require('./jwtMiddleware')

// const exclusions = ['/autenticacao', '/', '/api/votacao/votar/:temaid']

server.pre(cors.preflight)
server.use(cors.actual)
server.use(restify.plugins.bodyParser())
// server.use(jwtMiddleware({ exclusions }))

routes(server)

module.exports = server
