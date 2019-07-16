let coder
try {
  const { AbiCoder } = require('web3-eth-abi');
  coder = new AbiCoder();
} catch(e) {
  coder = require('web3-eth-abi')
}

const defaultFunctions = [
  ['transferEther(address,uint256)', '66', 'Transfer ether from the contract'],
  ['setMinimumTribute(uint256)', '66', 'Set the minimum wei that must be sent with any request to buy shares.'],
  ['safeExecute(bytes)', '66', 'Execute some bytecode in the context of the dao after checking it for dangerous opcodes.'],
  ['executeApplication(address)', '66', 'Accept an offer to purchase shares of the dao.'],
  ['addExtension((bytes32,address,bool,bytes,bytes4[]))', '75', 'Add an extension for use by the dao.'],
  ['removeExtension(uint256)', '66', 'Remove an extension.'],
  ['mintShares(address,uint64)', '66', 'Create shares for a user.'],
  ['setApprovalRequirement(bytes4,uint8)', '75', 'Set the approval requirement for a function as a percentage.'],
  ['setProposalDuration(uint64)', '66', 'Set the number of blocks each proposal will be open for.'],
  ['addToken(address)', '33', 'Add an ERC20 token for the DAO to use.'],
  ['approveTokenTransfer(address,address,uint256)', '66', 'Approve another address to withdraw tokens owned by the DAO.'],
  ['transferToken(address,address,uint256)', '66', 'Transfer an ERC20 token owned by the DAO.'],
  ['receiveToken(address,address,uint256)', '255', 'Make the DAO call transferFrom on an ERC20 token.']
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

/* 
1000
30000
["0xf024a95a","0x345a22cd","0xe033f73c","0x53f45e9c","0xb920ef71","0xdaa08539","0x701c3c28","0x02e4879d","0xd48bfca7","0x52a23bbb","0xf5537ede","0x4ec109f4"]
["66","66","51","75","66","66","75","66","33","66","66","255"] */
// console.log(JSON.stringify(signatures))
// console.log(JSON.stringify(requirements))
// console.log(coder.encodeParameters(['uint64', 'uint64', 'bytes4[]', 'uint8[]'], [10000, 50000, signatures, requirements]))

const shares = 1000;
const duration = 10000;

module.exports = { duration, requirements, shares, signatures, gas: 6.7e6, value: 0, signatureByName, functionDescriptions }
