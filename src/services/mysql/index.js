
const mysqlServer = require('mysql')

var knex = require('knex')({
  client: 'mysql',
  connection: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  }
})

const connection = mysqlServer.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
})

const errorHandler = (error, msg, rejectFunction) => {
  if (error) console.error(error)
  rejectFunction({ error: msg })
}

const dependencies = { connection, errorHandler, knex }

const authModule = require('./auth')(dependencies)
const systemModule = require('./system')(dependencies)
const votationModule = require('./votation')(dependencies)
const usersModule = require('./users')(dependencies)
const pautaModule = require('./pauta')(dependencies)
const sessoesModule = require('./sessoes')(dependencies)
const temasModule = require('./temas')(dependencies)

module.exports = {
  auth: () => authModule,
  system: () => systemModule,
  votation: () => votationModule,
  users: () => usersModule,
  pauta: () => pautaModule,
  sessoes: () => sessoesModule,
  temas: () => temasModule
}
