const {expect} = require('chai')
const Web3 = require('web3')
const web3 = new Web3('http://localhost:8545')

const {bytecode, abi} = require('../build/Permissioned')
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

  describe('Function Requirements', () => {
    it('Absolute Majority', async () => {
      const contract = await deploy(accounts[0], 51, 2, 1, 5)
      // Give acct #2 49 shares, acct #1 has all shares so should be able to force share minting
      let payload = contract.methods.mintShares(accounts[1], 49).encodeABI()
      await web3.eth.sendTransaction({from: accounts[0], data: payload, gas: 250000, to: contract._address})
      expect(await contract.methods.daoists(accounts[1]).call()).to.eq('49')
      expect(await contract.methods.totalShares().call()).to.eq('100')
      // Give acct #3 2 shares, acct #1 has majority so should be able to force share minting
      payload = contract.methods.mintShares(accounts[2], 2).encodeABI()
      await web3.eth.sendTransaction({from: accounts[0], data: payload, gas: 250000, to: contract._address})
      expect(await contract.methods.daoists(accounts[2]).call()).to.eq('2')
      expect(await contract.methods.totalShares().call()).to.eq('102')
      // Acct #1 no longer has the majority, so it can not give shares by itself
      payload = contract.methods.mintShares(accounts[2], 10).encodeABI()
      await web3.eth.sendTransaction({from: accounts[0], data: payload, gas: 250000, to: contract._address})
      expect(await contract.methods.daoists(accounts[2]).call()).to.eq('2')
      // With the votes from acct #2, a majority is reached and shares should be minted
      await web3.eth.sendTransaction({from: accounts[2], data: payload, gas: 250000, to: contract._address})
      expect(await contract.methods.daoists(accounts[2]).call()).to.eq('12')
    })
  }) 

  /* 
  
   const propHash = web3.utils.soliditySha3({
      t: 'bytes',
      v: contract.methods.mintShares(accounts[1], 500).encodeABI()
    });
    await contract.methods.submitOrVote(propHash).send({ from: accounts[0], gas: 4700000 })*/
})