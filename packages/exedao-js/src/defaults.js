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
  ['setMinimumRequestValue(uint256)', '66'],
  ['safeExecute(bytes)', '66'],
  ['unsafeExecute(bytes)', '90'],
  ['executeBuyOffer(address)', '50'],
  ['addExtension((bytes32,address,bool,bytes,bytes4[]))', '66'],
  ['removeExtension(uint256)', '66'],
  ['mintShares(address,uint64)', '66'],
  ['setApprovalRequirement(bytes4,uint8)', '66']
];

const signatures = [];
const requirements = [];
const signatureByName = {};
for (let req of defaultRequirements) {
  const name = req[0].split('(')[0]
  const signature = coder.encodeFunctionSignature(req[0]);
  signatureByName[name] = signature;
  signatures.push(signature);
  requirements.push(req[1]);
}

const shares = 1000;
const duration = 10000;

module.exports = { duration, requirements, shares, signatures, gas: 4700000, value: 0, signatureByName }
