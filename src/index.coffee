class App
  constructor: ->
    exports.App = @
    exports.ConsoleStyle.drawAscii()
    @loadConfig()
    exports.Database.run (err) =>
      if err
        exports.ConsoleStyle.error("Impossible de se connecter a la base de données")
        return
      @loadNetwork()

  loadConfig: ->
    exports.ConsoleStyle.infos("Lecture de la configuration ..")
    fs = require('fs')
    yaml = require('js-yaml')
    contents = fs.readFileSync("config.yml", 'utf8')
    data = yaml.load(contents)
    @config = data 
    exports.ConsoleStyle.infos("Configuration chargée avec succées !")

  loadNetwork: ->
    exports.Auth.start()

app = new App()
