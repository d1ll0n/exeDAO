const { randomBytes } = require('crypto');
const sigUtil = require('eth-sig-util');

const getChallengeParams = address => [
  { type: 'string', name: 'Message', value: `I certify that I am the owner of ${address}` },
  { type: 'bytes32', name: 'Verification ID', value: randomBytes(32).toString('hex') }
]

class AuthProvider {
  constructor(db) {
    this.db = db;
  }

  async setChallenge(address) {
    const challenge = getChallengeParams(address);
    const timestamp = new Date() - 0;
    await this.db.put(address, JSON.stringify({challenge, timestamp}));
    return challenge;
  }

  async getChallenge(address) {
    const challenge = await this.db.get(address);
    return JSON.parse(challenge);
  }

  async refresh(address) {
    const {challenge} = await this.getChallenge(address);
    const timestamp = new Date() - 0;
    await this.db.put(address, JSON.stringify({challenge, timestamp}));
    return timestamp;
  }

  async auth(address, signature) {
    const {challenge, timestamp} = await this.getChallenge(address);
    const timesince = new Date() - timestamp;
    if (timesince > 24 * 60 * 60 * 1000) throw new Error('Token expired');
    const recovered = sigUtil.recoverTypedSignature({ data: challenge, sig: signature });
    if (recovered !== address) throw new Error('Invalid signature');
    return true;
  }
}

module.exports = AuthProvider;