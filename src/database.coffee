class Account
  constructor: (@id, @username, @password, @pseudo, @email, @gmlevel) ->

class Database
  run: ->
    exports.ConsoleStyle.infos 'Tentative de connexion a la base de données ..'
    sqlite3 = require("sqlite3").verbose()
    fs = require("fs");
    file = "data.db"
    @db = new sqlite3.Database(file)
    exports.ConsoleStyle.infos 'Connecter a la base de données !'

  getAccountByUsername: (username, cb) ->
    @db.get "SELECT * FROM accounts WHERE username='#{username}'", (err, row) =>
      if row == undefined
        cb undefined
        return
      cb(new Account(row.id, row.username, row.password, row.pseudo, row.email, row.gmlevel))


exports.Database = new Database()
exports.Account = new Account()
