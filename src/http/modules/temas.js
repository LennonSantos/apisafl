
const db = require('../../services/mysql')

module.exports = function temas (server) {
  server.get('/api/temas', async (req, res, next) => {
    try {
      res.send(await db.temas().all())
    } catch (error) {
      res.send(422, error)
    }
    next()
  })

  server.get('/api/temas/:id', async (req, res, next) => {
    try {
      const {id} = req.params

      res.send(await db.temas().index(id))
    } catch (error) {
      res.send(422, error)
    }
    next()
  })

  server.put('/api/temas/:id', async (req, res, next) => {
    try {
      const {id} = req.params

      res.send(await db.temas().update(id, req.body))
    } catch (error) {
      res.send(422, error)
    }
    next()
  })

  server.post('/api/temas', async (req, res, next) => {
    try {
    //  const {nome, ativo, idUsuario, status} = req.body
    // res.send(req.body)

      res.send(await db.temas().store(req.body))
    } catch (error) {
      res.send(422, {error: error})
    }
    next()
  })

  server.del('/api/temas/:id', async (req, res, next) => {
    try {
      const {id} = req.params

      res.send(await db.temas().delete(id))
    } catch (error) {
      res.send(422, error)
    }
    next()
  })
}
