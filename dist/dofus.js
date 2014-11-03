(function() {
  var Auth, AuthClient;

  Auth = (function() {
    function Auth() {}

    Auth.prototype.start = function() {
      exports.ConsoleStyle.infos("Lancement des services d'authentification ..");
      this.net = require('net');
      this.clients = [];
      this.server = this.net.createServer((function(_this) {
        return function(socket) {
          exports.ConsoleStyle.infos("Input connection from " + socket.remoteAddress + ":" + socket.remotePort);
          return _this.clients.push(new AuthClient(socket));
        };
      })(this));
      return this.server.listen(444, (function(_this) {
        return function() {
          return exports.ConsoleStyle.infos("Les services d'authentification sont en ligne !");
        };
      })(this));
    };

    return Auth;

  })();

  AuthClient = (function() {
    function AuthClient(socket) {
      this.socket = socket;
      this.state = 1;
      this.account = void 0;
      this.disconnected = false;
      this.ticket = '';
      this.ip = this.socket.remoteAddress;
      this.key = exports.Utils.randomString(32);
      this.socket.on('data', (function(_this) {
        return function(data) {
          var p, _i, _len, _ref, _results;
          data = data.toString().replace('\x00', '').replace('\x0a', '');
          _ref = data.split('\n');
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            p = _ref[_i];
            if (p !== '') {
              _results.push(_this.parse(p.trim()));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
      })(this));
      this.socket.on('end', (function(_this) {
        return function() {
          return _this.onDisconnected();
        };
      })(this));
      this.send("HC" + this.key);
    }

    AuthClient.prototype.disconnect = function() {
      exports.ConsoleStyle.infos("Tentative de deconnexion du client " + this.ip);
      this.socket.destroy();
      return this.onDisconnected();
    };

    AuthClient.prototype.onDisconnected = function() {
      this.disconnected = true;
      exports.Auth.clients.splice(exports.Auth.clients.indexOf(this), 1);
      return exports.ConsoleStyle.infos('Client deconnecter !');
    };

    AuthClient.prototype.send = function(message) {
      exports.ConsoleStyle.debug('Send data : ' + message);
      return this.socket.write(message + '\x00');
    };

    AuthClient.prototype.parse = function(packet) {
      var cryptedPass, data, id, password, username;
      if (this.disconnected) {
        return;
      }
      exports.ConsoleStyle.debug('Data incoming : ' + packet);
      if (packet === "Af" || packet.trim() === '' || packet.charCodeAt(0) === 0) {
        return;
      }
      switch (this.state) {
        case -1:
          return this.disconnect();
        case 1:
          if (packet === '1.29.1') {
            return this.state = 2;
          } else {
            return this.state = -1;
          }
          break;
        case 2:
          data = packet.split('#');
          username = data[0];
          password = data[1];
          password = password.substr(1, password.length);
          cryptedPass = exports.Utils.cryptPass('test', this.key);
          exports.ConsoleStyle.debug("Client " + this.ip + " try to login on the account " + username + " and password " + password);
          return exports.Database.getAccountByUsername(username, (function(_this) {
            return function(account) {
              if (account !== void 0) {
                _this.state = 3;
                _this.account = account;
                _this.send("Ad" + _this.account.pseudo);
                _this.send("Ac0");
                _this.send("AH1;1;75;1");
                _this.send("Alk0");
                return exports.ConsoleStyle.infos("Le joueur " + _this.account.username + " est connecter !");
              } else {
                exports.ConsoleStyle.error("Le compte '" + username + "' est introuvable");
                return _this.send('AlEx');
              }
            };
          })(this));
        case 3:
          if (packet === "Ax") {
            exports.ConsoleStyle.infos("Listage des serveurs pour le joueur " + this.account.username);
            return this.send("AxK0|1,1");
          } else if (packet.charAt(0) === "A" && packet.charAt(1) === "X") {
            id = packet.substring(2, 3);
            exports.ConsoleStyle.infos("Le joueur " + this.account.username + " souhaite être connecté au serveur du monde (" + id + ")");
            this.ticket = exports.Utils.randomString(32);
            return this.send("AYK" + exports.App.config.game.ip + ":" + exports.App.config.game.port + ";" + this.ticket);
          }
      }
    };

    return AuthClient;

  })();

  exports.Auth = new Auth();

}).call(this);

(function() {
  var ConsoleStyle;

  ConsoleStyle = (function() {
    var colors;

    function ConsoleStyle() {}

    colors = require('colors');

    ConsoleStyle.drawAscii = function() {
      console.log('\n===================================================================='.black.bgGreen);
      console.log('======== Dofus.coffee, a Dofus server written in CoffeeScript ======'.black.bgGreen);
      return console.log('============================================= By NightWolf =========\n'.black.bgGreen);
    };

    ConsoleStyle.infos = function(message) {
      return console.log('[LOG]'.green + " : " + message);
    };

    ConsoleStyle.error = function(message) {
      return console.log('[ERROR]'.red + " : " + message);
    };

    ConsoleStyle.debug = function(message) {
      return console.log('[DEBUG]'.magenta + " : " + message);
    };

    return ConsoleStyle;

  })();

  exports.ConsoleStyle = ConsoleStyle;

}).call(this);

(function() {
  var Account, Database;

  Account = (function() {
    function Account(id, username, password, pseudo, email, gmlevel) {
      this.id = id;
      this.username = username;
      this.password = password;
      this.pseudo = pseudo;
      this.email = email;
      this.gmlevel = gmlevel;
    }

    return Account;

  })();

  Database = (function() {
    function Database() {}

    Database.prototype.run = function() {
      var file, fs, sqlite3;
      exports.ConsoleStyle.infos('Tentative de connexion a la base de données ..');
      sqlite3 = require("sqlite3").verbose();
      fs = require("fs");
      file = "data.db";
      this.db = new sqlite3.Database(file);
      return exports.ConsoleStyle.infos('Connecter a la base de données !');
    };

    Database.prototype.getAccountByUsername = function(username, cb) {
      return this.db.get("SELECT * FROM accounts WHERE username='" + username + "'", (function(_this) {
        return function(err, row) {
          if (row === void 0) {
            cb(void 0);
            return;
          }
          return cb(new Account(row.id, row.username, row.password, row.pseudo, row.email, row.gmlevel));
        };
      })(this));
    };

    return Database;

  })();

  exports.Database = new Database();

  exports.Account = new Account();

}).call(this);

(function() {
  var App, app;

  App = (function() {
    function App() {
      exports.App = this;
      exports.ConsoleStyle.drawAscii();
      this.loadConfig();
      exports.Database.run();
      this.loadNetwork();
    }

    App.prototype.loadConfig = function() {
      var contents, data, fs, yaml;
      exports.ConsoleStyle.infos("Lecture de la configuration ..");
      fs = require('fs');
      yaml = require('js-yaml');
      contents = fs.readFileSync("config.yml", 'utf8');
      data = yaml.load(contents);
      this.config = data;
      return exports.ConsoleStyle.infos("Configuration chargée avec succées !");
    };

    App.prototype.loadNetwork = function() {
      return exports.Auth.start();
    };

    return App;

  })();

  app = new App();

}).call(this);

(function() {


}).call(this);

(function() {
  var Utils;

  Utils = (function() {
    function Utils() {}

    Utils.randomString = function(length) {
      var hash, i, str, _i;
      hash = 'azertyuiopqsdfghjklmwxcvbn';
      str = '';
      for (i = _i = 0; 0 <= length ? _i <= length : _i >= length; i = 0 <= length ? ++_i : --_i) {
        str += hash.charAt(Math.floor(Math.random() * (hash.length - 0 + 1) + 0));
      }
      return str;
    };

    Utils.cryptPass = function(password, key) {
      var akey, anb, anb2, apass, crypted, hash, i, pkey, ppass, _i, _ref;
      hash = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '_'];
      crypted = '';
      for (i = _i = 0, _ref = password.lenth; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        ppass = password.charAt(i);
        pkey = key.charAt(i);
        apass = ppass / 16;
        akey = ppass % 16;
        anb = (apass + pkey) % hash.length;
        anb2 = (akey + pkey) % hash.length;
        crypted += hash[anb];
        crypted += hash[anb2];
      }
      return crypted;
    };

    return Utils;

  })();

  exports.Utils = Utils;

}).call(this);
