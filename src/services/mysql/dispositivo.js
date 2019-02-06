const dispositivo = deps => {
  return {
    all: () => {
      return new Promise((resolve, reject) => {
        const { errorHandler, knex } = deps

        knex('user_device')
          .select()
          .then((resp) => {
            resolve(resp)
          })
          .catch((error) => {
            errorHandler(error, `Falha ao buscar os dispositivos.`, reject)
          })
      })
    },
    update: (id) => {
      return new Promise((resolve, reject) => {
        const { errorHandler, knex } = deps

        knex('user_device')
          .where('id', id)
          .update({ativo: 0})
          .then((resp) => {
            resolve({msg: 'Atualizado com sucesso!'})
          })
          .catch((error) => {
            errorHandler(error, `Falha ao desativar o dispositivo.`, reject)
          })
      })
    }
  }
}

module.exports = dispositivo
