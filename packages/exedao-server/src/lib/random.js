const { randomBytes } = require('crypto');
module.exports = () => randomBytes(32).toString('hex');