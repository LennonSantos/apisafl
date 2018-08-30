
const sha1 = require('sha1')

const users = deps => {
  return {
    votos: (userid, idvotos) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query("select temas.id, temas.descricao, (select voto from temas_usuario where id_usuario = ? and id_tema = temas.id) as voto, temas.hora_inicio from temas where status_votacao = 2 and visivel_voto = 1  and temas.id not in(?)", [userid, idvotos], (error, results) => {
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
    save: (email, password) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, sha1(password)], (error, results) => {
          if (error) {
            errorHandler(error, `Falha ao salvar a usuário ${email}`, reject)
            return false
          }
          resolve({ user: { email, id: results.insertId } })
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
    logado: (id, logado) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query('UPDATE users SET logado = ? WHERE id = ?', [logado, id], (error, results) => {
          if (error || !results.affectedRows) {
            errorHandler(error, `Falha ao atualizar status logado.${id}`, reject)
            return false
          }
          resolve({})
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
          resolve({ message: 'usuário removido com sucesso!', affectedRows: results.affectedRows })
        })
      })
    },
    presencas: (userid) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query('select s.nome as sessao, p.id_sessao, u.name from sessaos as s inner join presencas as p on p.id_sessao = s.id inner join users as u on u.id = p.id_usuario where u.id = ? order by p.created_at desc', [userid], (error, results) => {
          if (error) {
            errorHandler(error, `Falha ao selecionar as presenças do usuário ${userid}`, reject)
            return false
          }
          resolve({ presencas: results })
        })
      })
    }
  }
}

module.exports = users
