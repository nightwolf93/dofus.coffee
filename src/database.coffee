class Account
  constructor: (@id, @username, @password, @pseudo, @secretQuestion, @secretAnswer, @adminLevel, @subscriptionEndDate, @points) ->

class Database
  run: (cbOk) ->
    exports.ConsoleStyle.infos 'Tentative de connexion a la base de données ..'
    mysql = require 'mysql'
    @connection = mysql.createConnection {
      host: exports.App.config.sql.host
      user: exports.App.config.sql.username
      password: exports.App.config.sql.password
    }
    @connection.connect (err) =>
      if err
        cbOk(err)
        return
      @connection.query 'USE ' + exports.App.config.sql.database, (err, rows, fields) =>
        exports.ConsoleStyle.infos 'Connecter a la base de données !'
        cbOk()

  getAccountByUsername: (username, cb) ->
      @connection.query "SELECT * FROM accounts WHERE username='#{username}'", (err, rows, fields) =>
        if (err)
          console.log err
          cb undefined
          return
        if rows.length > 0
          row = rows[0]
          account = new Account row.id, row.username, row.password, row.pseudo, row.secretQuestion, row.secretAnswer, row.adminLevel, row.subscriptionEndDate, row.points
          cb account
        else
          cb undefined

exports.Database = new Database()
exports.Account = new Account()
