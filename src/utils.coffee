class Utils
  @randomString: (length) ->
    hash = 'azertyuiopqsdfghjklmwxcvbn'
    str = ''
    for i in [0..length]
      str += hash.charAt Math.floor(Math.random() * (hash.length - 0 + 1) + 0)
    return str

  @cryptPass: (password, key) ->
    hash = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's',
                't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
                'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '_']
    crypted = ''
    for i in [0..password.lenth]
      ppass = password.charAt i
      pkey = key.charAt i
      apass = ppass / 16
      akey = ppass % 16
      anb = (apass + pkey) % hash.length
      anb2 = (akey + pkey) % hash.length
      crypted += hash[anb]
      crypted += hash[anb2]
    return crypted


exports.Utils = Utils
