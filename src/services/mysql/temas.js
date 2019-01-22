const temas = deps => {
  return {
    all: () => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query('select * from temas where ativo = 1', [], (error, results) => {
          if (error) {
            // verifica se o erro é relacionado ao voto duplo
            errorHandler(error, `Falha ao listar os temas.`, reject)

            return false
          }

          resolve(results)
        })
      })
    },
    index: (id) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query('select * from temas where id = ?', [id], (error, results) => {
          if (error) {
            errorHandler(error, `Falha ao lista o tema de id ${id}.`, reject)

            return false
          }

          resolve(results)
        })
      })
    },
    update: (id, values) => {
      return new Promise((resolve, reject) => {
        const { errorHandler, knex } = deps

        values.updated_at = new Date()

        knex('temas')
          .where('id', id)
          .update(values)
          .then((resp) => {
            resolve({msg: 'Atualizado com sucesso!'})
          })
          .catch((error) => {
            errorHandler(error, `Falha ao atualizar o tema.`, reject)
          })
      })
    },
    store: (values) => {
      return new Promise((resolve, reject) => {
        const { errorHandler, knex } = deps

        values.updated_at = new Date()
        values.created_at = new Date()
        values.id = 0
        values.id_usuario = 1
        values.ativo = 1
        values.visivel_voto = 1
        values.status_votacao = 0

        knex('temas').insert(values)
          .then((resp) => {
            resolve({msg: 'Salvo com sucesso!'})
          })
          .catch((error) => {
            errorHandler(error, `Falha ao salvar a sessão.`, reject)
          })
      })
    },
    // apenas desativa o tema
    delete: (id) => {
      return new Promise((resolve, reject) => {
        const { errorHandler, knex } = deps

        const updatedAt = new Date()

        knex('temas')
          .where('id', id)
          .update({ativo: 0, updated_at: updatedAt})
          .then((resp) => {
            resolve({msg: 'Desativado com sucesso!'})
          })
          .catch((error) => {
            errorHandler(error, `Falha ao desativar a sessão.`, reject)
          })
      })
    }
  }
}

module.exports = temas
