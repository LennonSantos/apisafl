
const system = deps => {
  return {
    version: () => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query('select title, version from system order by id desc limit 1', [], (error, results) => {
          if (error) {
            errorHandler(error, `Falha ao buscar a versão do sistema.`, reject)
            return false
          }

          const { title, version } = results[0]

          resolve({ title: title, version: version })
        })
      })
    }
  }
}

module.exports = system
