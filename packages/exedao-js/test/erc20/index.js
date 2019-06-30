const fs = require('fs');
const path = require('path')
const easySolc = require('exedao-sol/easy-solc');

const erc20 = fs.readFileSync(path.join(__dirname, 'ERC20.sol'), 'utf8')
const ierc20 = fs.readFileSync(path.join(__dirname, 'IERC20.sol'), 'utf8')
const safemath = fs.readFileSync(path.join(__dirname, 'SafeMath.sol'), 'utf8')

const sources = {
  'IERC20.sol': {content: ierc20},
  'SafeMath.sol': {content: safemath}
}
const {abi, bytecode} = easySolc.compile('ERC20', erc20, false, sources);

const deployToken = (web3, address) => {
  const contract = new web3.eth.Contract(abi);
  return new Promise((resolve, reject) => contract
    .deploy({data: bytecode})
    .send({from: address, gas: 5700000})
    .on('receipt', (receipt) => {
      contract._address = receipt.contractAddress;
      resolve(contract)
    })
    .on('error', (e) => reject(e))
  )
}

module.exports = deployToken;