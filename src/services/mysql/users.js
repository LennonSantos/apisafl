
const sha1 = require('sha1')

const users = deps => {
  return {
    votos: (userid) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query('select temas.id, temas.descricao, (select voto from temas_usuario where id_usuario = ? and id_tema = temas.id) as voto from temas where status_votacao = 2 and visivel_voto = 1', [userid], (error, results) => {
          if (error) {
            errorHandler(error, 'Falha ao listar os votos.', reject)
            return false
          }
          resolve({ votos: results })
        })
      })
    },
    all: () => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query('SELECT id, email FROM users', (error, results) => {
          if (error) {
            errorHandler(error, 'Falha ao listar as usuários', reject)
            return false
          }
          resolve({ users: results })
        })
      })
    },
    save: (cim, nloja) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        let email = 'igreja@test.com'
        let name = 'irmãos'

        connection.query('INSERT INTO users (name, email, password, cim, nr_loja, apto_votar) VALUES (?, ?, ?, ?, ?, ?)', [name, email, sha1(nloja), cim, sha1(nloja), 1], (error, results) => {
          if (error) {
            errorHandler(error, `Falha ao salvar a usuário ${cim}`, reject)
            return false
          }
          resolve({ cim, id: results.insertId, nloja})
        })
      })
    },
    update: (id, password) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query('UPDATE users SET password = ? WHERE id = ?', [sha1(password), id], (error, results) => {
          if (error || !results.affectedRows) {
            errorHandler(error, `Falha ao atualizar a usuário de id ${id}`, reject)
            return false
          }
          resolve({ user: { id }, affectedRows: results.affectedRows })
        })
      })
    },
    del: (id) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query('DELETE FROM users WHERE id = ?', [id], (error, results) => {
          if (error || !results.affectedRows) {
            errorHandler(error, `Falha ao remover a usuário de id ${id}`, reject)
            return false
          }
          resolve({ message: 'usuário removida com sucesso!', affectedRows: results.affectedRows })
        })
      })
    }
  }
}

module.exports = users
