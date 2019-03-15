
const db = require('../../services/mysql')

module.exports = function presenca (server) {
  server.get('/api/presenca/verifica/:cim/:idsessao', async (req, res, next) => {
    try {
      const {cim, idsessao} = req.params

      res.send(await db.presenca().verifica(cim, idsessao))
      // res.send(`cim: ${cim} - idsessao: ${idsessao}`)
    } catch (error) {
      res.send(422, error)
    }
    next()
  })

  server.get('/api/presenca/user/:cim', async (req, res, next) => {
    try {
      const {cim} = req.params

      res.send(await db.presenca().user(cim))
      // res.send(`cim: ${cim} - idsessao: ${idsessao}`)
    } catch (error) {
      res.send(422, error)
    }
    next()
  })

  server.get('/api/presenca/salvar/:idusuario/:idsessao', async (req, res, next) => {
    try {
      const {idusuario, idsessao} = req.params

      res.send(await db.presenca().salvar(idusuario, idsessao))
      // res.send(`cim: ${cim} - idsessao: ${idsessao}`)
    } catch (error) {
      res.send(422, error)
    }
    next()
  })
}
