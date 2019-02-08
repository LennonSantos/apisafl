const relatorio = deps => {
  return {
    presenca: (idsessao) => {
      return new Promise((resolve, reject) => {
        const {errorHandler, knex} = deps

        knex.raw(`select(select count(DISTINCT p.id_usuario) from presencas as p inner join sessaos as s on s.id = p.id_sessao where s.id = ${idsessao}) as total`)
          .then((resp) => {
            resolve(resp)
          })
          .catch((error) => {
            errorHandler(error, `Falha ao buscar o relatorio de presença ${error}.`, reject)
          })
      })
    },
    resumo: (idsessao) => {
      return new Promise((resolve, reject) => {
        const {errorHandler, knex} = deps

        knex.raw(`select descricao as tema, 
                          quantidade_sim as sim, 
                          quantidade_nao as nao, 
                          quantidade_abstensao as abstencao,
                          case
                      when status_votacao = 0 then 'Não iniciada'
                          when status_votacao = 1 then 'Em andamento'
                          when status_votacao = 2 then 'Finalizada'
                      end as status
                  from temas 
                  where id_sessao = ${idsessao}`)
          .then((resp) => {
            resolve(resp)
          })
          .catch((error) => {
            errorHandler(error, `Falha ao buscar o resumo da sessão ${error}.`, reject)
          })
      })
    }
    // presenca: (idsessao) => {
    //   return new Promise((resolve, reject) => {
    //     const { errorHandler, knex } = deps

    //     knex.where('id_sessao', idsessao).select().table('presencas')
    //       .then((resp) => {
    //         resolve(resp)
    //       })
    //       .catch((error) => {
    //         errorHandler(error, `Falha ao buscar o relatorio de presença ${error}.`, reject)
    //       })
    //   })
    // }
  }
}

module.exports = relatorio
