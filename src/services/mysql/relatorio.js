const relatorio = deps => {
  return {
    presenca: (idsessao) => {
      return new Promise((resolve, reject) => {
        const { errorHandler, knex } = deps

        knex('presencas')
          .where('id_sessao', idsessao)
          .select()
          .then((resp) => {
            resolve(resp)
          })
          .catch((error) => {
            errorHandler(error, `Falha ao buscar o relatorio de presença ${error}.`, reject)
          })
      })
    }
  }
}

module.exports = relatorio
