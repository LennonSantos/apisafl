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
              // errorHandler(error, `temaid: ${temaid} userid: ${userid} voto: ${voto}`, reject)
            }

            return false
          }

          resolve({ voto: voto })
        })
      })
    },
    // busca tema em andamento
    select: (userid) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps

        const query = 'select now() as hora_atual,  id, descricao, hora_inicio, tempo_disponivel, qualificada from temas where status_votacao = 1 and (select count(voto.id_tema) from temas_usuario as voto where voto.id_tema = temas.id and voto.id_usuario = ?) < 1  limit 1'

        connection.query(query, [userid], (error, results) => {
          if (error) {
            errorHandler(error, `Erro ao procurar tema.`, reject)
            return false
          }

          resolve({tema: results[0]})
        })
      })
    }
  }
}

module.exports = votation
