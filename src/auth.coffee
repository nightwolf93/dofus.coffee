class Auth
  start: ->
    exports.ConsoleStyle.infos "Lancement des services d'authentification .."
    @net = require 'net'
    @clients = []
    @server = @net.createServer (socket) =>
      exports.ConsoleStyle.infos "Input connection from #{socket.remoteAddress}:#{socket.remotePort}"
      @clients.push new AuthClient(socket)

    @server.listen 444, =>
      exports.ConsoleStyle.infos "Les services d'authentification sont en ligne !"

class AuthClient
  constructor: (@socket) ->
    @state = 1
    @account = undefined
    @disconnected = false
    @ip = @socket.remoteAddress
    @key = exports.Utils.randomString 32

    @socket.on 'data', (data) =>
      data = data.toString().replace('\x00', '').replace('\x0a', '')
      for p in data.split '\n'
        if p != ''
          @parse p.trim()
    @socket.on 'end', =>
      @onDisconnected()

    @send "HC#{@key}"

  disconnect: ->
    exports.ConsoleStyle.infos "Tentative de deconnexion du client #{@ip}"
    @socket.destroy()
    @onDisconnected()

  onDisconnected: ->
    @disconnected = true
    exports.Auth.clients.splice exports.Auth.clients.indexOf(@), 1
    exports.ConsoleStyle.infos 'Client deconnecter !'

  send: (message) ->
    exports.ConsoleStyle.debug 'Send data : ' + message
    @socket.write message + '\x00'

  parse: (packet) ->
    if @disconnected then return
    exports.ConsoleStyle.debug 'Data incoming : ' + packet
    if packet == "Af" || packet.trim() == '' || packet.charCodeAt(0) == 0 then return
    switch @state
      when -1
        @disconnect()
      when 1 # Version
        if packet == '1.29.1' then @state = 2 else @state = -1
      when 2 # Account
        data =  packet.split('#')
        username = data[0]
        password = data[1]
        password = password.substr(1, password.length)
        cryptedPass = exports.Utils.cryptPass 'test', @key
        exports.ConsoleStyle.debug "Client #{@ip} try to login on the account #{username} and password #{password}"
        exports.Database.getAccountByUsername username, (account) =>
          if account != undefined
            @state = 3
            @account = account
          else
            exports.ConsoleStyle.error "Le compte '#{username}' est introuvable"
            @send 'AlEx'

      when 3 # World
        exports.ConsoleStyle.infos 'Listage des serveurs ..'

exports.Auth = new Auth()
