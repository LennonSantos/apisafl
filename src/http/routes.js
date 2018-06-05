const db = require('../services/mysql')

const routes = (server) => {
  // realiza a autenticação do usuário
  server.post('/api/authenticate', async (req, res, next) => {
    try {
      const { cim, password, uuid, modelo, plataforma, versao } = req.body

      const user = await db.auth().authenticate(cim, password)

      const sessaoid = await db.auth().sessao()

      // 2 - verifica se existe sessão ativa
      if (!sessaoid[0]) {
        res.send(422, {error: 'Não existe sessão ativa.'})
        return false
      }

      // salva presença
      const presenca = await db.auth().presenca(user.id, sessaoid[0].sessaoid)
      if (!presenca[0]) {
        res.send(422, {error: presenca})
        return false
      }

      // 3 - busca o uuid
      const dispositivo = await db.auth().dispositivo(cim)
      if (!dispositivo[0]) {
        await db.auth().dispositivosave(cim, uuid, modelo, plataforma, versao)
      } else {

      }

      res.send({token: user.token, uuid: uuid, modelo: modelo, plataforma: plataforma, versao: versao, sessaoid: sessaoid[0].sessaoid, dispositivo: dispositivo})
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

  // responde os meus votos
  server.get('/api/meusvotos/:userid', async (req, res, next) => {
    try {
      const { userid } = req.params

      res.send(await db.users().votos(userid))
    } catch (error) {
      res.send(422, error)
    }
    next()
  })

  // responde os meus votos
  server.get('/api/pauta', async (req, res, next) => {
    try {
      res.send(await db.pauta().all())
    } catch (error) {
      res.send(422, error)
    }
    next()
  })
}

module.exports = routes
