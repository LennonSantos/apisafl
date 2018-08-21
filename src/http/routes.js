require('dotenv').config()

const db = require('../services/mysql')
// const server = require('http').createServer()
const io = require('socket.io-client')('http://'+process.env.SOCKET_HOST)

const routes = (server) => {
  // realiza a autenticação do usuário
  server.post('/api/authenticate', async (req, res, next) => {
    try {
      // recebe os valores de post
      const { cim, password, uuid, modelo, plataforma, versao } = req.body

      // buscar o user pelo cim e password
      const user = await db.auth().authenticate(cim, password)

      // se não esta apto a votar retorna erro
      if (!user.apto_votar) {
        res.send(422, {error: 'Deputado irregular.'})
        return false
      }

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
      
      // 4 - informa que o usuario ja logou
      await db.users().logado(user.id, 1)

      // resposta do login
      res.send({id: user.id, nome: user.name, sessaoid: sessaoid[0].sessaoid})
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

      const result = await db.votation().save(temaid, voto, userid)

      // se realmente votou emitir o evento do voto
      if (result.voto.length) {
        io.emit('voto', {voto: voto})
      }

      res.send(result)
    } catch (error) {
      res.send(422, error)
    }
    next()
  })

  // responde os meus votos
  server.post('/api/meusvotos', async (req, res, next) => {
    try {
      const { userid, idvotos } = await req.body

      // res.send({userid: userid, idvotos: idvotos})

      res.send(await db.users().votos(userid, idvotos))
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

  // responde as presencas do usuario
  server.post('/api/pauta', async (req, res, next) => {
    try {
      const {userid, idsessao} = req.body

      res.send(await db.auth().presenca(userid, idsessao))
    } catch (error) {
      res.send(422, error)
    }
    next()
  })
}

module.exports = routes
