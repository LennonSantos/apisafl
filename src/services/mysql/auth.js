
const sha1 = require('sha1')
const jwt = require('jsonwebtoken')

const auth = deps => {
  return {
    authenticate: (cim, password) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps
        const queryString = 'SELECT id, email, name, apto_votar FROM users WHERE cim = ? AND password = ?'
        const queryData = [cim, sha1(password)]

        console.log(queryData)

        connection.query(queryString, queryData, (error, results) => {
          if (error || !results.length) {
            errorHandler(error, 'Não conseguimos localizar o usuário, verifique se os dados estão corretos.', reject)
            return false
          }

          const { email, id, name, apto_votar } = results[0]

          const token = jwt.sign(
            { email, id },
            process.env.JWT_SECRET,
            { expiresIn: 60 * 60 * 24 }
          )

          resolve({ token, id: id, name: name, apto_votar: apto_votar })
        })
      })
    },
    sessao: () => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query("select id as sessaoid from sessaos where status = 'andamento' ", (error, results) => {
          if (error) {
            errorHandler(error, 'Falha ao identificar a sessão ativa.', reject)
            return false
          }
          resolve(results)
        })
      })
    },
    dispositivo: (cim) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query('select cim, uuid, modelo from user_device where cim = ? and ativo = 1', [cim], (error, results) => {
          if (error) {
            errorHandler(error, 'Falha ao identificar o disponitivo.', reject)
            return false
          }
          resolve(results)
        })
      })
    },
    dispositivosave: (cim, uuid, modelo, plataforma, versao) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query('insert into user_device (cim, uuid, created_at, updated_at, modelo, plataforma, versao, ativo) values (?, ?, current_date(), current_date(), ?, ?, ?, 1)', [cim, uuid, modelo, plataforma, versao], (error, results) => {
          if (error) {
            errorHandler(error, `Falha ao salvar o dispositivo.`, reject)
            return false
          }
          resolve({})
        })
      })
    },
    presenca: (userid, sessaoid) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query('select id_usuario from presencas where id_usuario = ? and id_sessao = ?', [userid, sessaoid], (error, results) => {
          if (error) {
            errorHandler(error, `Falha ao identificar a presença.`, reject)
            return false
          }
          resolve(results)
        })
      })
    },
    presencasave: (userid, sessaoid) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query('insert into presencas (id_usuario, id_sessao, created_at, updated_at) value (?, ?, now(), now())', [userid, sessaoid], (error, results) => {
          if (error) {
            errorHandler(error, `Falha ao salvar a presença.`, reject)
            return false
          }
          resolve(results)
        })
      })
    }
  }
}

module.exports = auth
