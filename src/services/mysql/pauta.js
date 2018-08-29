const pauta = deps => {
  return {
    all: (temaid, voto, userid) => {
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
    }
  }
}

module.exports = pauta
