let coder
try {
  const { AbiCoder } = require('web3-eth-abi');
  coder = new AbiCoder();
} catch(e) {
  coder = require('web3-eth-abi')
}

const signatureOf = (functionAbi) => coder.encodeFunctionSignature(Object.assign({ inputs: [] }, functionAbi));

module.exports = {
  signatureOf
};
