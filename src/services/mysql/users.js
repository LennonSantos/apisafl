
const sha1 = require('sha1')

const users = deps => {
  return {
    votos: (userid, idvotos) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query('select temas.id, temas.descricao, (select voto from temas_usuario where id_usuario = ? and id_tema = temas.id) as voto, temas.hora_inicio from temas where status_votacao in(1, 2) and visivel_voto = 1  and temas.id not in(?)', [userid, idvotos], (error, results) => {
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

        connection.query('SELECT * FROM users', (error, results) => {
          if (error) {
            errorHandler(error, 'Falha ao listar as usuários', reject)
            return false
          }
          resolve(results)
        })
      })
    },
    index: (cim) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query('select * from users where cim = ?', [cim], (error, results) => {
          if (error) {
            errorHandler(error, `Falha ao lista o usuario de cim ${cim}.`, reject)

            return false
          }

          resolve(results)
        })
      })
    },
    save: (user) => {
      return new Promise((resolve, reject) => {
        const { knex, errorHandler } = deps

        user.password = sha1(user.nr_loja)
        user.created_at = new Date()
        user.updated_at = new Date()

        knex('users').insert(user)
          .then((resp) => {
            resolve({msg: 'Salvo com sucesso!'})
          })
          .catch((error) => {
            errorHandler(error, `Falha ao salvar o usuario. ${error}`, reject)
          })
      })
    },
    update: (id, values) => {
      return new Promise((resolve, reject) => {
        const { knex, errorHandler } = deps

        values.updated_at = new Date()
        values.password = sha1(values.nr_loja)

        delete values['__index']
        delete values['id']
        delete values['created_at']

        knex('users')
          .where('id', id)
          .update(values)
          .then((resp) => {
            resolve({msg: 'Atualizado com sucesso!'})
          })
          .catch((error) => {
            errorHandler(error, `Falha ao atualizar o usuário. ${error}`, reject)
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
        // connection.query('select s.nome as sessao, p.id_sessao, u.name from sessaos as s inner join presencas as p on p.id_sessao = s.id inner join users as u on u.id = p.id_usuario where u.id = ? order by p.created_at desc', [userid], (error, results) => {
        connection.query("select s.id as id_sessao, s.nome as sessao, (select count(p.id_sessao) from presencas as p where p.id_sessao = s.id and p.id_usuario = ?) as presenca from sessaos as s where s.status in('andamento', 'finalizado') order by s.created_at desc", [userid], (error, results) => {
          if (error) {
            errorHandler(error, `Falha ao selecionar as presenças do usuário ${userid}. errod ${error}`, reject)
            return false
          }
          resolve({ presencas: results })
        })
      })
    }
  }
}

module.exports = users
