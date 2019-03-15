const presenca = deps => {
  return {
    user: (cim) => {
      return new Promise((resolve, reject) => {
        const { errorHandler, knex } = deps

        knex.raw(`select * from users where cim = ${cim}`)
          .then((resp) => {
            resolve(resp[0])
          })
          .catch((error) => {
            errorHandler(error, `Falha ao buscar o usuario.`, reject)
          })
      })
    },
    verifica: (cim, idSessao) => {
      return new Promise((resolve, reject) => {
        const { errorHandler, knex } = deps

        knex.raw(`select u.cim, u.name, u.nome_loja, u.id as id_user, p.id_sessao 
              from users as u
              inner join presencas as p
              on p.id_usuario = u.id
              where p.id_sessao = ${idSessao}
              and u.cim = ${cim}`)
          .then((resp) => {
            resolve(resp[0])
          })
          .catch((error) => {
            errorHandler(error, `Falha ao buscar os presencas.`, reject)
          })
      })
    },
    salvar: (idUser, idSessao) => {
      return new Promise((resolve, reject) => {
        const {errorHandler, knex} = deps

        knex('presencas').insert({id_usuario: idUser, id_sessao: idSessao})
          .then((resp) => {
            resolve({msg: 'Salvo com sucesso!'})
          })
          .catch((error) => {
            errorHandler(error, `Falha ao salvar a presença. Erro: ${error.code}`, reject)
          })
      })
    }
  }
}

module.exports = presenca
