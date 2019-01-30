
const db = require('../../services/mysql')

module.exports = function users (server) {
  server.get('/api/usuario', async (req, res, next) => {
    try {
      res.send(await db.users().all())
    } catch (error) {
      res.send(422, error)
    }
    next()
  })

  server.get('/api/usuario/:cim', async (req, res, next) => {
    try {
      res.send(await db.users().index(req.params.cim))
    } catch (error) {
      res.send(error)
    }
    next()
  })

  server.post('/api/usuario', async (req, res, next) => {
    try {
      res.send(await db.users().save(req.body))
    } catch (error) {
      res.send(422, error)
    }
    next()
  })

  server.put('/api/usuario/:id', async (req, res, next) => {
    const { id } = req.params
    try {
      res.send(await db.users().update(id, req.body))
    } catch (error) {
      res.send(422, error)
    }
    next()
  })

  server.del('/api/usuario/:id', async (req, res, next) => {
    const { id } = req.params
    try {
      res.send(await db.users().del(id))
    } catch (error) {
      res.send(422, error)
    }
    next()
  })
}
