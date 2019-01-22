const sessoes = deps => {
  return {
    all: () => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query('select * from sessaos where ativo = 1', [], (error, results) => {
          if (error) {
            // verifica se o erro é relacionado ao voto duplo
            errorHandler(error, `Falha ao listar as sessões.`, reject)

            return false
          }

          resolve(results)
        })
      })
    },
    index: (id) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query('select * from sessaos where id = ?', [id], (error, results) => {
          if (error) {
            // verifica se o erro é relacionado ao voto duplo
            errorHandler(error, `Falha ao lista a sessões de id ${id}.`, reject)

            return false
          }

          resolve(results)
        })
      })
    },
    update: (nome, status, id) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        const updatedAt = new Date()

        connection.query('UPDATE sessaos SET nome = ?, status = ?, updated_at = ? WHERE id = ?', [nome, status, updatedAt, id], (error, results) => {
          if (error) {
            // verifica se o erro é relacionado ao voto duplo
            errorHandler(error, `Falha ao atualizar a sessão de id ${id}.`, reject)

            return false
          }

          resolve({msg: 'Atualizado com sucesso!'})
        })
      })
    },
    store: (nome, ativo, idUsuario, status) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        const createdAt = new Date()

        connection.query('INSERT INTO sessaos (nome, ativo, id_usuario, created_at, updated_at, status) VALUES (?, ?, ?, ?, ?, ?)', [nome, ativo, idUsuario, createdAt, createdAt, status], (error, results) => {
          if (error) {
            // verifica se o erro é relacionado ao voto duplo
            errorHandler(error, `Falha ao salvar a sessão.`, reject)

            return false
          }

          resolve({msg: 'Salvo com sucesso!'})
        })
      })
    },
    // apenas desativa a sessão
    delete: (id) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        const updatedAt = new Date()

        connection.query('UPDATE sessaos SET ativo = 0, updated_at = ? WHERE id = ?', [updatedAt, id], (error, results) => {
          if (error) {
            // verifica se o erro é relacionado ao voto duplo
            errorHandler(error, `Falha ao desativar a sessão.`, reject)

            return false
          }

          resolve({msg: 'Desativado com sucesso!'})
        })
      })
    },
    atual: () => {
      return new Promise((resolve, reject) => {
        const { knex, errorHandler } = deps

        knex.table('sessaos').where('status', 'andamento').where('ativo', 1).first('id', 'nome')
          .then(sessao => {
            knex.where('id_sessao', sessao.id).where('ativo', 1).select().table('temas')
              .then((temas) => {
                resolve({sessao: sessao, temas: temas})
              })
              .catch((error) => {
                errorHandler(error, `Falha ao buscar os temas da sessão atual.`, reject)
              })
          })
          .catch((error) => {
            errorHandler(error, `Falha ao buscar a sessão atual.`, reject)
          })
      })
    }
  }
}

module.exports = sessoes
