const fs = require('fs');
const path = require('path')

const {abi, bytecode} = JSON.parse(fs.readFileSync(path.join(__dirname, 'erc20.json'), 'utf8'))
const deployToken = (web3, address) => {
  const contract = new web3.eth.Contract(abi);
  return new Promise((resolve, reject) => contract
    .deploy({data: bytecode})
    .send({from: address, gas: 4500000})
    .on('receipt', (receipt) => {
      contract._address = receipt.contractAddress;
      resolve(contract)
    })
    .on('error', (e) => reject(e))
  )
}

module.exports = deployToken;