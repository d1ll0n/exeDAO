const multihashes = require('multihashes');
const CID = require('cids');
const {digest} = require('multihashing')
const detJson = require('./deterministicJSON');

/**
 * @dev the hash slinging slasher
 */
class Hasher {
  constructor(web3) {
    this.soliditySha3 = web3.utils.soliditySha3;
  }

  sha3(value) { return this.soliditySha3(value) }
  
  sha3Bytes(value) { return this.soliditySha3({ t: 'bytes', v: value }) }

  jsonSha3(obj) {
    const json = detJson(obj);
    const buf = Buffer.from(json)
    return '0x' + digest(buf, 'sha3-256').toString('hex')
    // return this.sha3(Buffer.from(json))
  }

  toMh(shaHash) {
    const buf = Buffer.from(shaHash, 'hex');
    return multihashes.encode(buf, 'sha3-256');
  }

  toCid(mh) {
    const cid = new CID(1, 'raw', Buffer.from(mh, 'hex'), 'base32');
    return cid.toBaseEncodedString();
  }

  shaToCid(hash) {
    return this.toCid(this.toMh(hash.slice(2)).toString('hex'))
  }

  hash(encodedCall) {
    const eth = this.sha3(encodedCall);
    const ipfs = this.shaToCid(eth);
    return {eth, ipfs};
  }
}

module.exports = Hasher;