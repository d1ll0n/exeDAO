const jwt = require('jsonwebtoken')

module.exports = (secret, expiration = '24d') => ({
  sign: data => jwt.sign(data, secret, {expiresIn: expiration}),
  verify: token => jwt.verify(token, secret)
});


