const votation = deps => {
  return {
    save: (temaid, voto, userid) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        connection.query('insert into temas_usuario (id_tema, id_usuario, voto) values (?, ?, ?)', [temaid, userid, voto], (error, results) => {
          if (error) {
            // verifica se o erro é relacionado ao voto duplo
            if (error.code === 'ER_DUP_ENTRY') {
              errorHandler(error, `Você já votou neste tema.`, reject)
            } else {
              errorHandler(error, `Falha ao salvar o voto. Erro código: ${error.code}`, reject)
            }

            return false
          }

          resolve({ voto: voto })
        })
      })
    }
  }
}

module.exports = votation
