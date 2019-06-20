const { AbiCoder } = require('web3-eth-abi');
const multihashes = require('multihashes');
const CID = require('cids');
const coder = new AbiCoder();

const signatureOf = (functionAbi) => coder.encodeFunctionSignature(functionAbi);

const votesNeeded = (approvalRequirement, totalShares, votes) => {
  if (approvalRequirement === 255) return 0;
  const totalNeeded = Math.floor(1+totalShares*approvalRequirement/100);
  return votes >= totalNeeded ? 0 : totalNeeded-votes;
};

const toMh = (shaHash) => {
  const buf = Buffer.from(shaHash, 'hex');
  return multihashes.encode(buf, 'sha3-256');
};

const toSha = (mh) => new CID(mh).multihash.toString('hex').slice(4);

module.exports = {
  votesNeeded,
  signatureOf,
  toMh,
  toSha
};
