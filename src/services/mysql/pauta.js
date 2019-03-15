const pauta = deps => {
  return {
    andamento: () => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query("select p.pauta, p.descricao from pautas as p inner join sessaos as s on p.id_sessao = s.id where s.status = 'andamento' limit 1", [], (error, results) => {
          if (error) {
            // verifica se o erro é relacionado ao voto duplo
            errorHandler(error, `Falha ao listar a pauta.`, reject)

            return false
          }

          resolve({ pauta: results[0].pauta, descricao: results[0].descricao })
        })
      })
    },
    all: () => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query('select p.* from pautas as p inner join sessaos as s on s.id = p.id_sessao where s.ativo = 1', [], (error, results) => {
          if (error) {
            // verifica se o erro é relacionado ao voto duplo
            errorHandler(error, `Falha ao listar as pautas.`, reject)

            return false
          }

          resolve(results)
        })
      })
    },
    save: (values) => {
      return new Promise((resolve, reject) => {
        const { errorHandler, knex } = deps

        values.ativo = 1
        values.created_at = new Date()
        values.updated_at = new Date()

        knex('pautas').insert(values)
          .then((resp) => {
            resolve({msg: 'Salvo com sucesso!'})
          })
          .catch((error) => {
            errorHandler(error, `Falha ao salvar a a pauta. Erro: ${error.code}`, reject)
          })
      })
    },
    update: (id, values) => {
      return new Promise((resolve, reject) => {
        delete values['__index']
        delete values['id']
        delete values['created_at']

        const { errorHandler, knex } = deps

        values.updated_at = new Date()

        knex('pautas')
          .where('id', id)
          .update(values)
          .then((resp) => {
            resolve({msg: 'Atualizado com sucesso!'})
          })
          .catch((error) => {
            errorHandler(error, `Falha ao atualizar a pauta. ${error}`, reject)
          })
      })
    }
  }
}

module.exports = pauta
