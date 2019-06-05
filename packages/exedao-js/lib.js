const { AbiCoder } = require('web3-eth-abi');
const coder = new AbiCoder();
const {abi} = require('./build/exeDAO')

const getFunctionInfo = (rawFunctionDefinition) => {
  let [name, types] = rawFunctionDefinition.split('(')
  types = types.replace(')','').split(',')
  let signature = coder.encodeFunctionSignature(rawFunctionDefinition);
  let encodeCall = args => signature + coder.encodeParameters(types, args).slice(2);
  return {name, signature, encodeCall}
}

const votesNeeded = (requirement, totalShares, yes, no) => {
  switch(requirement) {
    case '1':
      return 1 + no - yes;
    case '2':
      return Math.ceil(totalShares/2) + 1 - yes;
    case '3':
      return Math.ceil(totalShares*2/3) + 1 - yes;
    case '4':
      return Math.ceil(totalShares*9/10) + 1 - yes;
    default:
      return null;
  }
}

module.exports = {
  getFunctionInfo,
  votesNeeded
};