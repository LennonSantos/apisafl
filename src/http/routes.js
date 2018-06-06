const db = require('../services/mysql')
// const server = require('http').createServer()
const io = require('socket.io-client')('http://10.0.2.74:6379')

const routes = (server) => {
  // realiza a autenticação do usuário
  server.post('/api/authenticate', async (req, res, next) => {
    try {
      // recebe os valores de post
      const { cim, password, uuid, modelo, plataforma, versao } = req.body

      // buscar o user pelo cim e password
      const user = await db.auth().authenticate(cim, password)

      // busca a sesão ativa
      const sessaoid = await db.auth().sessao()

      // 2 - verifica se existe sessão ativa
      if (!sessaoid[0]) {
        res.send(422, {error: 'Não existe sessão ativa.'})
        return false
      }

      // 3 - verifica se ja tem dispositivo cadastrado
      const dispositivo = await db.auth().dispositivo(cim)
      if (!dispositivo[0]) {
        await db.auth().dispositivosave(cim, uuid, modelo, plataforma, versao)
      } else {
        if (dispositivo[0].uuid !== uuid) {
          res.send(422, {error: `Identificamos que sua conta esta vinculada ao dispositivo ${dispositivo[0].modelo}, procure a equipe de suporte mais próxima para vincular o novo aparelho.`})
        }
      }

      // salva presença
      const presenca = await db.auth().presenca(user.id, sessaoid[0].sessaoid)
      if (!presenca[0]) {
        await db.auth().presencasave(user.id, sessaoid[0].sessaoid)
      }

      // resposta do login
      res.send({id: user.id, irregular: !user.irregular, nome: user.name, token: user.token, uuid: uuid, modelo: modelo, plataforma: plataforma, versao: versao, sessaoid: sessaoid[0].sessaoid, dispositivo: dispositivo})
    } catch (error) {
      res.send(422, error)
    }
    next()
  })

  // retorna a vesão da api
  server.get('/', async (req, res, next) => {
    try {
      io.emit('votacao-channel:App\\Events\\VotacaoIniciarEvent', {teste: 'teste'})
      console.log('teste')

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

      // io.emmit('votacao-channel:App\\Events\\VotacaoIniciarEvent', {teste: 'teste'})

      res.send(await db.votation().save(temaid, voto, userid))
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
