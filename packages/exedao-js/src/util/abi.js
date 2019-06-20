const { AbiCoder } = require('web3-eth-abi');
const coder = new AbiCoder();

const signatureOf = (functionAbi) => coder.encodeFunctionSignature(Object.assign({ inputs: [] }, functionAbi));

module.exports = {
  signatureOf
};
