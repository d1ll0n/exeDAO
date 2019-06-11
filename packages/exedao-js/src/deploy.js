const defaults = require('./defaults');
const {abi} = require('../build/abi');
const {bytecode} = require('../build/bytecode')
const rpcCall = require('kool-makerpccall');
const {
    stripHexPrefix,
    addHexPrefix
} = require('ethereumjs-util');
const abiCoder = require('web3-eth-abi').AbiCoder();

const toArgs = ({ shares, duration, requirements, signatures }) =>
    [shares, duration, signatures, requirements];

const deploy = (web3, from, options) => {
    const _options = {...defaults, ...options}
    const { host } = web3.currentProvider;
    return rpcCall(host, 'eth_sendTransaction', [{
      from,
      gas: _options.gas,
      value: _options.value,
      gasPrice: _options.gasPrice || '1' + Array(9).join('0'),
      data: addHexPrefix(bytecode) + stripHexPrefix(abiCoder.encodeParameters(['uint32', 'uint32', 'bytes4[]', 'uint8[]'], toArgs(_options)))
    }]);
};

module.exports = deploy;
