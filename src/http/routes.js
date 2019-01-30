require('dotenv').config()

const db = require('../services/mysql')
// const server = require('http').createServer()
const io = require('socket.io-client')('http://' + process.env.SOCKET_HOST)

const sessoes = require('./modules/sessoes')
const temas = require('./modules/temas')
const users = require('./modules/users')

const routes = (server) => {
  // rota das sessoes
  sessoes(server)
  temas(server)
  users(server)

  // realiza a autenticação do usuário
  server.post('/api/authenticate', async (req, res, next) => {
    try {
      // recebe os valores de post
      const { cim, password, uuid, modelo, plataforma, versao } = req.body

      // buscar o user pelo cim e password
      const user = await db.auth().authenticate(cim, password)

      // se não esta apto a votar retorna erro
      if (!user.apto_votar) {
        res.send(422, {error: 'Você não esta apto a votar, verifique sua situação com a equipe de suporte.'})
        return false
      }

      // busca a sesão ativa
      const sessaoid = await db.auth().sessao()

      // 3 - verifica se existe sessão ativa
      if (!sessaoid[0]) {
        res.send(422, {error: 'Não existe sessão em andamento.'})
        return false
      }

      // 4 - verifica se ja tem dispositivo cadastrado
      const dispositivo2 = await db.auth().dispositivo2(uuid)
      if (dispositivo2[0] && dispositivo2[0].cim.toString() !== cim.toString()) {
        res.send(422, {error: 'Identificamos que o seu dipositivo esta vinculada a uma conta ativa com o cim ' + dispositivo2[0].cim + ', procure a equipe de suporte para mais informações.'})
        return false
      }
      // 4 - verifica se ja tem dispositivo cadastrado
      const dispositivo = await db.auth().dispositivo(cim, uuid)
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

      // informa que o usuario ja logou
      await db.users().logado(user.id, 1)

      // resposta do login
      res.send({id: user.id, nome: user.name, sessaoid: sessaoid[0].sessaoid, sessaonome: sessaoid[0].sessaonome, nomeloja: `${user.nome_loja} - ${password}`, oriente: `${user.cidade} - ${user.uf_loja}`, mandato: `${user.inicio}/${user.termino}`})
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

  // verifica se existe votação em andamento
  server.post('/api/andamento/votacao', async (req, res, next) => {
    try {
      const { userid } = req.body

      // presenca automatica
      const presencaautomatica = await db.auth().presencaautomatica(userid)
      if (presencaautomatica.presenca === 0) {
        // salvar presenca automatica aqui aqui
        await db.auth().presencasave(userid, presencaautomatica.sessaoid)
      } // - presenca automatica

      const result = await db.votation().select(userid)

      res.send(result)
    } catch (error) {
      res.send(422, error)
    }
    next()
  })

  // realiza a votação do sistema
  server.get('/api/votacao/votar/:temaid/:voto/:userid/:uuid', async (req, res, next) => {
    try {
      const { temaid, voto, userid, uuid } = req.params

      const verificaUuid = await db.votation().verificaUuid(userid, uuid)
      if (verificaUuid.error) {
        res.send(422, {error: 'Erro! Este usuário esta registrado em outro dispositivo.'})
        return false
      }

      // presenca automatica
      const presencaautomatica = await db.auth().presencaautomatica(userid)
      if (presencaautomatica.presenca === 0) {
        // salvar presenca automatica aqui aqui
        await db.auth().presencasave(userid, presencaautomatica.sessaoid)
      } // - presenca automatica

      const result = await db.votation().save(temaid, voto, userid)

      // se realmente votou emitir o evento do voto
      if (result.voto.length) {
        io.emit('voto', {voto: voto})
      }

      res.send(result)
      // res.send({})
    } catch (error) {
      res.send(422, {error: error})
    }
    next()
  })

  // responde os meus votos
  server.post('/api/meusvotos', async (req, res, next) => {
    try {
      const { userid, idvotos } = await req.body

      // presenca automatica
      const presencaautomatica = await db.auth().presencaautomatica(userid)
      if (presencaautomatica.presenca === 0) {
        // salvar presenca automatica aqui aqui
        await db.auth().presencasave(userid, presencaautomatica.sessaoid)
      } // - presenca automatica

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

  // retorna todas as presenças do usuario
  server.post('/api/presencas', async (req, res, next) => {
    try {
      const {userid} = req.body

      // presenca automatica
      const presencaautomatica = await db.auth().presencaautomatica(userid)
      if (presencaautomatica.presenca === 0) {
        // salvar presenca automatica aqui aqui
        await db.auth().presencasave(userid, presencaautomatica.sessaoid)
      } // - presenca automatica

      res.send(await db.users().presencas(userid))
    } catch (error) {
      res.send(422, error)
    }
    next()
  })

  // RESPONSAVEL POR INICIAR A VOTAÇAO
  server.post('/votacao/iniciar', async (req, res, next) => {
    try {
      const result = await db.votation().iniciar(req.body)

      io.emit('iniciar-votacao', result)

      res.send(result)
    } catch (error) {
      res.send(422, {msg: 'Não foi possível iniciar a votação!', error: error})
    }
    next()
  })

  // RESPONSAVEL POR FINALIZAR A VOTAÇAO
  server.post('/votacao/finalizar/:id', async (req, res, next) => {
    try {
      const { id } = req.params

      const {sim, nao, abstenho} = req.body

      const votos = {
        quantidade_nao: nao,
        quantidade_sim: sim,
        quantidade_abstensao: abstenho
      }

      await db.votation().finalizar(id, votos)

      io.emit('finalizar-votacao')

      res.send({msg: 'Votação finalizada com sucesso!!!'})
    } catch (error) {
      res.send(422, {msg: `Não foi possível finalizar a votação! ${error}`, error: error})
    }
    next()
  })
}

module.exports = routes
