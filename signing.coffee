crypto = require('crypto')
base64url = require('base64-url')
config = require('./config')

salt = 'django.core.signing'

rsplit = (token, sep, maxsplit) ->
    split = token.split(sep)

    if maxsplit
        return [ split.slice(0, -maxsplit).join(sep) ].concat(split.slice(-maxsplit))

    return split

exports.verify = (token) ->
    [value, sig] = rsplit(token, ':', 1)

    shasum = crypto.createHash('sha1')
    shasum.update(salt + 'signer' + config.secret)

    hmacKey = shasum.digest()

    hmac = crypto.createHmac('sha1', hmacKey)

    hmac.setEncoding('base64')
    hmac.update(value)

    key = base64url.escape(hmac.digest('base64'))

    return key == sig
