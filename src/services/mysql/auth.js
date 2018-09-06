
const sha1 = require('sha1')
const jwt = require('jsonwebtoken')

const auth = deps => {
  return {
    authenticate: (cim, password) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps
        const queryString = 'SELECT id, email, name, apto_votar, nome_loja, uf_loja, cidade, year(inicio_mandato) as inicio, year(termino_mandato) as termino  FROM users WHERE cim = ? AND password = ?'
        const queryData = [cim, sha1(password)]

        connection.query(queryString, queryData, (error, results) => {
          if (error || !results.length) {
            errorHandler(error, 'Não conseguimos localizar o usuário, verifique se os dados estão corretos.', reject)
            return false
          }

          const { email, id, name, apto_votar, nome_loja, uf_loja, cidade, inicio, termino } = results[0]

          const token = jwt.sign(
            { email, id },
            process.env.JWT_SECRET,
            { expiresIn: 60 * 60 * 24 }
          )

          resolve({ token, id: id, name: name, apto_votar: apto_votar, nome_loja, uf_loja, cidade, inicio, termino })
        })
      })
    },
    sessao: () => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query("select id as sessaoid, nome as sessaonome from sessaos where status = 'andamento' ", (error, results) => {
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
    dispositivo2: (uuid) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query('select cim, uuid from user_device where uuid = ?  and ativo = 1', [uuid], (error, results) => {
          if (error) {
            errorHandler(error, 'Falha ao identificar o disponitivo pelo uuid.', reject)
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
    presencaautomatica: (userid) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query("select s.id as sessaoid, (select count(p.id_usuario) from presencas as p where p.id_usuario = ? and p.id_sessao = s.id) as presenca from sessaos as s where s.status = 'andamento'", [userid], (error, results) => {
          if (error) {
            errorHandler(error, `Falha ao identificar a presença.`, reject)
            return false
          }

          if (results[0]) {
            resolve({sessaoid: results[0].sessaoid, presenca: results[0].presenca})        
          }
          else {
            resolve({})
          }  
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
