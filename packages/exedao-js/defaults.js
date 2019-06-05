const { AbiCoder } = require('web3-eth-abi');
const coder = new AbiCoder();

/*
0 = not allowed
1 = basic majority (more yes than no votes)
2 = absolute majority (>1/2)
3 = super majority (>2/3)
4 = ultra majority (>9/10)
*/

const defaultRequirements = [
  ['setMinimumRequestValue(uint)', 3],
  ['safeExecute(bytes)', 3],
  ['unsafeExecute(bytes)', 4],
  ['executeBuyOffer(address)', 2],
  ['addExtension(address,bool,string[])', 3],
  ['removeExtension(uint)', 3],
  ['mintShares(address,uint32)', 3],
  ['setProposalRequirement(bytes4,uint8)]', 3]
];

const signatures = [];
const requirements = [];
for (let req of defaultRequirements) {
  signatures.push(coder.encodeFunctionSignature(req[0]));
  requirements.push(req[1]);
}

const shares = 1000;
const duration = 10000;

module.exports = { duration, requirements, shares, signatures }