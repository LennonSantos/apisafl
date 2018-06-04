const db = require('../services/mysql')

const routes = (server) => {
  // realiza a autenticação do usuário
  server.post('autenticacao', async (req, res, next) => {
    try {
      const { email, password } = req.body
      res.send(await db.auth().authenticate(email, password))
    } catch (error) {
      res.send(422, error)
    }
    next()
  })

  // retorna a vesão da api
  server.get('/', async (req, res, next) => {
    try {
      res.send(await db.system().version())
    } catch (error) {
      res.send(422, error)
    }
    next()
  })

  // realiza a votação do sistema
  server.get('/api/votacao/votar/:temaid/:voto/:userid', async (req, res, next) => {
    try {
      const { temaid, voto, userid } = req.params

      res.send(await db.votation().save(temaid, voto, userid))
      // res.send({temaid: temaid, voto: voto, userid: userid})
    } catch (error) {
      res.send(422, error)
    }
    next()
  })
}

module.exports = routes
