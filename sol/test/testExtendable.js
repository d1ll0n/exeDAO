const {expect} = require('chai')
const Web3 = require('web3')
const web3 = new Web3('http://localhost:8545')
const fs = require('fs')
const path = require('path')
const solc = require('../easy-solc')

const {bytecode, abi} = require('../build/Extendable')
let accounts, contract

const getFunctionSignature = web3.eth.abi.encodeFunctionSignature
const mintSig = getFunctionSignature('mintShares(address,uint64)')
const setReqSig = '0x0eb3e6aa'
const addSig = getFunctionSignature('addFunctions(address,bool[],bytes4[])')

const deploy = (address, shares, mintReq = 1, setReqReq = 1, duration = 0) => new web3.eth.Contract(abi)
  .deploy({ data: bytecode, arguments: [shares, [mintSig, setReqSig, addSig], [mintReq, setReqReq, 1], duration] })
  .send({ from: address, gas: 4700000, value: 100000000000000 })

const deployExtension = (address, src, interface) => new web3.eth.Contract(interface)
  .deploy({ data: src }).send({ from: address, gas: 4700000 })

before(async () => {
  accounts = await web3.eth.getAccounts()
  contract = await deploy(accounts[0], 1000)
})

module.exports = describe('Extendable.sol', () => {
  it('Should add 5+5 in an extension function', async () => {
    const src = fs.readFileSync(path.join(__dirname, 'sol', 'Output.sol'), 'utf8')
    const compiled = solc('Output', src)
    const outputSig = getFunctionSignature('add(uint256,uint256)')
    const ext = await deployExtension(accounts[0], compiled.bytecode, compiled.abi)
    let payload = contract.methods.addFunctions(ext._address, [false], [outputSig]).encodeABI()
    await web3.eth.sendTransaction({ from: accounts[0], data: payload, gas: 250000, to: contract._address })
    payload = contract.methods.setProposalRequirement(outputSig, 1).encodeABI()
    await web3.eth.sendTransaction({ from: accounts[0], data: payload, gas: 250000, to: contract._address })
    payload = ext.methods.add(5, 5).encodeABI()
    let receipt = await web3.eth.sendTransaction({ from: accounts[0], data: payload, gas: 250000, to: contract._address })
    expect(parseInt(receipt.logs[2].data, 16)).to.eq(10)
  })

  describe('Opcode Restriction', () => {
    it('Should disallow delegatecall', async () => {
      const src = fs.readFileSync(path.join(__dirname, 'sol', 'Delegate.sol'), 'utf8')
      const compiled = solc('Delegate', src)
      const ext = await deployExtension(accounts[0], compiled.bytecode, compiled.abi)
      const outputSig = getFunctionSignature('add(uint256)')
      let payload = contract.methods.addFunctions(ext._address, [false], [outputSig]).encodeABI()
      await web3.eth.sendTransaction({ from: accounts[0], data: payload, gas: 250000, to: contract._address })
        .then(() => {throw new Error('Should have thrown')})
        .catch(err => {
          expect(err.message).to.eq('Returned error: VM Exception while processing transaction: revert Bytecode not allowed')
        })
    })

    it('Should disallow sstore', async () => {
      const src = fs.readFileSync(path.join(__dirname, 'sol', 'SStore.sol'), 'utf8')
      const compiled = solc('SStore', src)
      const ext = await deployExtension(accounts[0], compiled.bytecode, compiled.abi)
      const outputSig = getFunctionSignature('add(uint256)')
      let payload = contract.methods.addFunctions(ext._address, [false], [outputSig]).encodeABI()
      await web3.eth.sendTransaction({ from: accounts[0], data: payload, gas: 250000, to: contract._address })
        .then(() => {throw new Error('Should have thrown')})
        .catch(err => {
          expect(err.message).to.eq('Returned error: VM Exception while processing transaction: revert Bytecode not allowed')
        })
    })
  })

  /* 
  
   const propHash = web3.utils.soliditySha3({
      t: 'bytes',
      v: contract.methods.mintShares(accounts[1], 500).encodeABI()
    });
    await contract.methods.submitOrVote(propHash).send({ from: accounts[0], gas: 4700000 })*/
})