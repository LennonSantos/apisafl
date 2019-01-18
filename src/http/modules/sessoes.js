
const db = require('../../services/mysql')

module.exports = function sessoes (server) {
  server.get('/api/sessoes', async (req, res, next) => {
    try {
      res.send(await db.sessoes().all())
    } catch (error) {
      res.send(422, error)
    }
    next()
  })

  server.get('/api/sessoes/:id', async (req, res, next) => {
    try {
      const {id} = req.params

      res.send(await db.sessoes().index(id))
    } catch (error) {
      res.send(422, error)
    }
    next()
  })

  server.put('/api/sessoes/:id', async (req, res, next) => {
    try {
      const {id} = req.params

      const {nome, status} = req.body

      res.send(await db.sessoes().update(nome, status, id))
    } catch (error) {
      res.send(422, error)
    }
    next()
  })

  server.post('/api/sessoes', async (req, res, next) => {
    try {
      const {nome, ativo, idUsuario, status} = req.body

      res.send(await db.sessoes().store(nome, ativo, idUsuario, status))
    } catch (error) {
      res.send(422, error)
    }
    next()
  })

  server.del('/api/sessoes/:id', async (req, res, next) => {
    try {
      const {id} = req.params

      res.send(await db.sessoes().delete(id))
    } catch (error) {
      res.send(422, error)
    }
    next()
  })
}
