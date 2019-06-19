const jwt = require('jsonwebtoken')

module.exports = (secret, expiration = '24h') => ({
  sign: data => jwt.sign(data, secret, {expiresIn: expiration}),
  verify: token => jwt.verify(token, secret)
});


