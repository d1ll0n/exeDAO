const {votesNeeded} = require('./exedao');
const deterministicJSON = require('./deterministicJSON');

const stripDecimals = (s, e) => {
  s = String(s);
  const i = s.lastIndexOf('.');
  if (~i) {
    const decimals = s.length - i - 1;
    if (decimals <= e) return s;
    return s.substr(0, i + e + 1).replace(/\.$/, '');
  }
  return s;
};

module.exports = {deterministicJSON, votesNeeded, stripDecimals};