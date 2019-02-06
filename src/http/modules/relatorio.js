
const db = require('../../services/mysql')

module.exports = function relatorio (server) {
  server.get('/api/relatorio/presenca/:idsessao', async (req, res, next) => {
    try {
      res.send(await db.relatorio().presenca(req.params.idsessao))
    } catch (error) {
      res.send(422, error)
    }
    next()
  })
}
