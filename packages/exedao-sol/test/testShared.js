const {expect} = require('chai')
const Web3 = require('web3')
const web3 = new Web3('http://localhost:8545')

const {bytecode, abi} = require('../build/Shared')
let contract, accounts

before(async () => {
    accounts = await web3.eth.getAccounts()
    contract = await deploy(accounts[0], 1000)
})

const deploy = (address, shares) => new web3.eth.Contract(abi)
  .deploy({ data: bytecode, arguments: [shares] })
  .send({ from: address, gas: 4700000, value: 100000000000000 })

describe('Shared.sol', () => {
  it('Should have deployed a shared contract', () => {
    expect(contract._address).exist
  })

  it('Should initialize shares', async () => {
    const shares = await contract.methods.daoists(accounts[0]).call()
    expect(shares).to.eq('1000')
  })

  it('Should burn shares', async () => {
    const balance = await web3.eth.getBalance(accounts[0])
    const receipt = await contract.methods.burnShares(1000).send({ from: accounts[0] })
    const balance2 = await web3.eth.getBalance(accounts[0])
    
    expect(+balance + 100000000000000 - receipt.gasUsed * 20000000000).to.eq(+balance2)
  })
})