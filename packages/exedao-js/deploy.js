const { duration, requirements, shares, signatures } = require('./defaults');
const {abi, bytecode} = require('./build/exeDAO');

const deploy = (web3, from, gas, value) => new web3.eth.Contract(abi)
  .deploy({ data: bytecode, arguments: [shares, duration, signatures, requirements] })
  .send({ from, gas, value });

module.exports = deploy;