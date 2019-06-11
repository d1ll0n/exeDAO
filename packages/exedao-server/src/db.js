const level = require('level');
const path = require('path');
const dbpath = path.join(__dirname, '.db');
const db = level(dbpath);

module.exports = {
  get: key => db.get(key).catch(e => null),
  put: db.put
}