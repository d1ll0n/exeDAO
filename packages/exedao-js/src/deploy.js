const defaults = require('./defaults');
const {abi} = require('../build/abi');
const {bytecode} = require('../build/bytecode')

const toArgs = ({ shares, duration, requirements, signatures }) =>
  [shares, duration, signatures, requirements];

const deploy = (web3, from, options) => {
  const _options = {...defaults, ...options}
  const contract = new web3.eth.Contract(abi)
  const transaction = contract.deploy({ data: bytecode, arguments: toArgs(_options) })
  return new Promise((resolve, reject) => {
    transaction.send({ from, gas: _options.gas, value: _options.value })
      .on('receipt', (receipt) => {
        contract._address = receipt.contractAddress;
        resolve(contract)
      })
      .on('error', (e) => reject(e))
  })
    
}

module.exports = deploy;