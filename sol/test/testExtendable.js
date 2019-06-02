const {expect} = require('chai')
const Web3 = require('web3')
const web3 = new Web3('http://localhost:8545')

const {bytecode, abi} = require('../build/Extendable')
let accounts

const getFunctionSignature = web3.eth.abi.encodeFunctionSignature
const mintSig = getFunctionSignature('mintShares(address,uint64)')
const setReqSig = '0x0eb3e6aa'

const deploy = (address, shares, mintReq, setReqReq, duration = 0) => new web3.eth.Contract(abi)
  .deploy({ data: bytecode, arguments: [shares, [mintSig, setReqSig], [mintReq, setReqReq], duration] })
  .send({ from: address, gas: 4700000, value: 100000000000000 })

before(async () => {
  accounts = await web3.eth.getAccounts()
})

module.exports = describe('Permissioned.sol', () => {
  it('Should initialize function requirements', async () => {
    const contract = await deploy(accounts[0], 1000, 1, 1)
    const req = await contract.methods.proposalRequirements(mintSig).call()
    expect(req).to.eq('1')
  })

  it('Should mint shares', async () => {
    const contract = await deploy(accounts[0], 1000, 1, 1)
    const payload = contract.methods.mintShares(accounts[1], 500).encodeABI()
    await web3.eth.sendTransaction({from: accounts[0], data: payload, gas: 250000, to: contract._address})
    const shares = await contract.methods.daoists(accounts[1]).call()
    expect(shares).to.eq('500')
  })

  it('Should set a proposal requirement', async () => {
    const contract = await deploy(accounts[0], 1000, 1, 1)
    const payload = contract.methods.setProposalRequirement(mintSig, 4).encodeABI()
    await web3.eth.sendTransaction({from: accounts[0], data: payload, gas: 250000, to: contract._address})
    const req = await contract.methods.proposalRequirements(mintSig).call()
    expect(req).to.eq('4')
  })

  /* 
  
   const propHash = web3.utils.soliditySha3({
      t: 'bytes',
      v: contract.methods.mintShares(accounts[1], 500).encodeABI()
    });
    await contract.methods.submitOrVote(propHash).send({ from: accounts[0], gas: 4700000 })*/
})