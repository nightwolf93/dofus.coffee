class ConsoleStyle
  colors = require('colors')

  @drawAscii: ->
    console.log '\n===================================================================='.black.bgGreen
    console.log '======== Dofus.coffee, a Dofus server written in CoffeeScript ======'.black.bgGreen
    console.log '============================================= By NightWolf =========\n'.black.bgGreen

  @infos: (message) ->
    console.log('[LOG]'.green + " : " + message)

  @error: (message) ->
    console.log('[ERROR]'.red + " : " + message)

  @debug: (message) ->
    console.log('[DEBUG]'.magenta + " : " + message)

exports.ConsoleStyle = ConsoleStyle
