
const {util: {deterministicJSON: detJson}} = require('exedao-js')
const multihashes = require('multihashes');
const CID = require('cids');

const toCid = async (hash) => {
  const buf = Buffer.from(hash.slice(2), 'hex');
  // mhA()
  const mh = multihashes.encode(buf, 'sha3-256')
  const cid = new CID(1, 'raw', mh, 'base32');
  return cid.toBaseEncodedString();
}

module.exports = {
  detJson,
  toCid
}