
const mysqlServer = require('mysql')

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

const dependencies = { connection, errorHandler }

const authModule = require('./auth')(dependencies)
const systemModule = require('./system')(dependencies)
const votationModule = require('./votation')(dependencies)

module.exports = {
  auth: () => authModule,
  system: () => systemModule,
  votation: () => votationModule
}
