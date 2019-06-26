const {expect} = require('chai')
const Web3 = require('web3')
const ganache = require('ganache-cli')
const web3 = new Web3(ganache.provider())

const {bytecode, abi} = require('../build/BaseDAO')
let contract, accounts

before(async () => {
    accounts = await web3.eth.getAccounts()
    contract = await deploy(accounts[0], 1000)
})

const deploy = (address, shares) => new web3.eth.Contract(abi)
  .deploy({ data: bytecode, arguments: [shares] })
  .send({ from: address, gas: 5700000, value: 100000000000000 })

describe('BaseDAO.sol', () => {
  it('Should have deployed a shared contract', () => {
    expect(contract._address).exist
  })

  it('Should initialize shares', async () => {
    const {shares} = await contract.methods.getDaoist(accounts[0]).call()
    expect(shares).to.eq('1000')
  })

  it('Should burn shares', async () => {
    const balance = await web3.eth.getBalance(accounts[0])
    const receipt = await contract.methods.burnShares(1000).send({ from: accounts[0] })
    const balance2 = await web3.eth.getBalance(accounts[0])
    const price = await web3.eth.getGasPrice()
    expect(+balance + 100000000000000 - receipt.gasUsed * price).to.eq(+balance2)
  })
})