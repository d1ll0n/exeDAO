const {expect} = require('chai')
const Web3 = require('web3')
const ganache = require('ganache-cli')
const web3 = new Web3(ganache.provider())
const fs = require('fs')
const path = require('path')
const solc = require('../easy-solc')
const { AbiCoder } = require('web3-eth-abi');
const coder = new AbiCoder();

const signatureOf = (functionAbi) => coder.encodeFunctionSignature(functionAbi);

const {bytecode, abi} = require('../build/ExeDAO')
let accounts, contract

const safeExecuteSig = signatureOf('safeExecute(bytes)')

const z32 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
const z20 = '0x0000000000000000000000000000000000000000';

const deploy = (address, shares, duration = 100, mintReq = 51, setReqReq = 51) => {
  const contract = new web3.eth.Contract(abi);
  return new Promise((resolve, reject) => contract
    .deploy({ data: bytecode, arguments: [shares, duration, [safeExecuteSig], [51]] })
      .send({ from: address, gas: 6.7e6, value: 100000000000000 })
        .on('receipt', (receipt) => {
          contract._address = receipt.contractAddress;
          resolve(contract)
        })
        .on('error', (e) => reject(e))
  );
}

before(async () => {
  accounts = await web3.eth.getAccounts()
  contract = await deploy(accounts[0], 1000)
  const _solc = await new Promise((resolve, reject) =>
    require('solc').loadRemoteVersion('v0.5.0+commit.1d4f565a',
      (err, _solc) => err ? reject(err) : resolve(_solc)))
  solc.setSolc(_solc)
})

module.exports = describe('Extendable.sol', () => {
  it('Should add 5+5 in a safeExecute', async () => {
    const src = fs.readFileSync(path.join(__dirname, 'sol', 'ExecuteAdd.sol'), 'utf8')
    const compiled = solc.compile('ExecuteAdd', src)
    let payload = contract.methods.safeExecute(compiled.bytecode).encodeABI()
    const receipt = await web3.eth.sendTransaction({ from: accounts[0], data: payload, gas: 4700000, to: contract._address })
    expect(parseInt(receipt.logs[1].data, 16)).to.eq(5)
  })
})