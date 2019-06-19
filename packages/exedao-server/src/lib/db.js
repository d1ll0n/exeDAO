const level = require('level');
const path = require('path');
const dbpath = path.join(__dirname, '..', '.db');
const db = level(dbpath);
const randomBytes = require('./random');

const _get = (...args) => db.get(...args).catch(e => null);
const _put = (...args) => db.put(...args);
const getSecret = async () => {
  const secret = await _get('jwt-secret')
  if (!secret) await _put('jwt-secret', (secret = randomBytes()));
  return secret;
}

module.exports = {
  get: (...args) => db.get(...args).catch(e => null),
  put: (...args) => db.put(...args),
  getSecret
}