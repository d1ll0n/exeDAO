const {expect} = require('chai')
const Web3 = require('web3')
const ganache = require('ganache-cli')
const web3 = new Web3(ganache.provider())
const { AbiCoder } = require('web3-eth-abi');
const coder = new AbiCoder();

const signatureOf = (functionAbi) => coder.encodeFunctionSignature(functionAbi);

const {bytecode, abi} = require('../build/Permissioned')
const {abi: erc20Abi, bytecode: erc20Bytecode} = require('./erc20');

const mintSig = signatureOf('mintShares(address,uint64)')
const setReqSig = signatureOf('setApprovalRequirement(bytes4,uint8)')

const addTokenSig = signatureOf('addToken(address)');
const approveTokenTransferSig = signatureOf('approveTokenTransfer(address,address,uint256)')
const transferTokenSig = signatureOf('transferToken(address,address,uint256)')
const receiveTokenSig = signatureOf('receiveToken(address,address,uint256)')

const deployToken = (address) => {
  const contract = new web3.eth.Contract(erc20Abi);
  return new Promise((resolve, reject) => contract
    .deploy({data: erc20Bytecode})
    .send({from: address, gas: 5700000})
    .on('receipt', (receipt) => {
      contract._address = receipt.contractAddress;
      resolve(contract)
    })
    .on('error', (e) => reject(e))
  )
}

const deploy = (address, shares = 1000, duration = 100, mintReq = 51, setReqReq = 51) => {
  const contract = new web3.eth.Contract(abi)
  return new Promise((resolve, reject) => contract
    .deploy({
        data: bytecode,
        arguments: [
          shares, duration,
          [mintSig, setReqSig, addTokenSig, approveTokenTransferSig, transferTokenSig, receiveTokenSig],
          [mintReq, setReqReq, 50, 66, 66, 255]
        ] 
      })
      .send({ from: address, gas: 5700000, value: 100000000000000 })
        .on('receipt', (receipt) => {
          contract._address = receipt.contractAddress;
          resolve(contract)
        })
        .on('error', (e) => reject(e))
  )
}
  

let accounts, erc20, contract
before(async () => {
  accounts = await web3.eth.getAccounts()
  erc20 = await deployToken(accounts[0])
  contract = await deploy(accounts[0])
})

module.exports = describe('Test token functions', () => {
  it('Should deploy an ERC20 token', async () => {
    expect(erc20._address).exist
  })

  it('Should mint some of the new token', async () => {
    await erc20.methods.getTokens(1000).send({from: accounts[1], gas: 5700000});
    const balance = await erc20.methods.balanceOf(accounts[1]).call();
    expect(balance).to.eq('1000');
  })
  
  it('Should approve the DAO to transfer some tokens', async () => {
    await erc20.methods.approve(contract._address, 500).send({from: accounts[1], gas: 5700000});
    const allowance = await erc20.methods.allowance(accounts[1], contract._address).call();
    expect(allowance).to.eq('500');
  })

  it('Should add an erc20 for use by the DAO', async () => {
    const addr = erc20._address;
    const payload = contract.methods.addToken(addr).encodeABI()
    await web3.eth.sendTransaction({ from: accounts[0], data: payload, gas: 4700000, to: contract._address })
    const token = await contract.methods.getToken(addr).call();
    expect(token.tokenAddress).to.eq(addr);
    expect(token.value).to.eq('0');
  })

  it('Should transfer some tokens to the DAO', async () => {
    const payload = contract.methods.receiveToken(erc20._address, accounts[1], 500).encodeABI()
    await web3.eth.sendTransaction({ from: accounts[0], data: payload, gas: 4700000, to: contract._address })
    const token = await contract.methods.getToken(erc20._address).call();
    expect(token.value).to.eq('500');
    const balance = await erc20.methods.balanceOf(contract._address).call();
    expect(balance).to.eq('500');
  })

  it('Should transfer some tokens from the DAO', async () => {
    const payload = contract.methods.transferToken(erc20._address, accounts[2], 250).encodeABI()
    await web3.eth.sendTransaction({ from: accounts[0], data: payload, gas: 4700000, to: contract._address })
    const token = await contract.methods.getToken(erc20._address).call();
    expect(token.value).to.eq('250');
    const balance = await erc20.methods.balanceOf(accounts[2]).call();
    expect(balance).to.eq('250');
  })

  it('Should approve transfer of some tokens from the DAO', async () => {
    const payload = contract.methods.approveTokenTransfer(erc20._address, accounts[2], 250).encodeABI()
    await web3.eth.sendTransaction({ from: accounts[0], data: payload, gas: 4700000, to: contract._address })
    const allowance = await erc20.methods.allowance(contract._address, accounts[2]).call();
    expect(allowance).to.eq('250')
    const token = await contract.methods.getToken(erc20._address).call();
    expect(token.value).to.eq('250');
    await erc20.methods.transferFrom(contract._address, accounts[2], 250).send({from: accounts[2], gas: 5700000});
    const balance = await erc20.methods.balanceOf(accounts[2]).call();
    expect(balance).to.eq('500');
  })
})