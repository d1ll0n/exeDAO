const { AbiCoder } = require('web3-eth-abi');
const coder = new AbiCoder();
/*
0 = not allowed
1 = basic majority (more yes than no votes)
2 = absolute majority (>1/2)
3 = super majority (>2/3)
4 = ultra majority (>9/10)
*/

const defaultFunctions = [
  ['setMinimumRequestValue(uint256)', '66', 'Set the minimum wei that must be sent with any request to buy shares.'],
  ['safeExecute(bytes)', '66', 'Execute some bytecode in the context of the dao after checking it for dangerous opcodes.'],
  ['unsafeExecute(bytes)', '90', 'Execute some bytecode in the context of the dao without checking it for dangerous opcodes.'],
  ['executeBuyOffer(address)', '50', 'Accept an offer to purchase shares of the dao.'],
  ['addExtension((bytes32,address,bool,bytes,bytes4[]))', '66', 'Add an extension for use by the dao.'],
  ['removeExtension(uint256)', '66', 'Remove an extension.'],
  ['mintShares(address,uint64)', '66', 'Create shares for a user.'],
  ['setApprovalRequirement(bytes4,uint8)', '66', 'Set the approval requirement for a function as a percentage.'],
  ['setProposalDuration(uint64)', '66', 'Set the number of blocks each proposal will be open for.']
];

const signatures = [];
const requirements = [];
const signatureByName = {};
const functionDescriptions = {};

for (let req of defaultFunctions) {
  const name = req[0].split('(')[0]
  const signature = coder.encodeFunctionSignature(req[0]);
  signatureByName[name] = signature;
  signatures.push(signature);
  requirements.push(req[1]);
  functionDescriptions[signature] = req[2];
}

const shares = 1000;
const duration = 10000;

module.exports = { duration, requirements, shares, signatures, gas: 4700000, value: 0, signatureByName, functionDescriptions }
