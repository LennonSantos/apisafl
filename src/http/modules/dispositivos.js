
const db = require('../../services/mysql')

module.exports = function sessoes (server) {
  server.get('/api/dispositivos', async (req, res, next) => {
    try {
      res.send(await db.dispositivo().all())
    } catch (error) {
      res.send(422, error)
    }
    next()
  })

  server.put('/api/dispositivos/:id', async (req, res, next) => {
    try {
      const {id} = req.params

      res.send(await db.dispositivo().update(id))
    } catch (error) {
      res.send(422, error)
    }
    next()
  })
}
