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

const {bytecode, abi} = require('../build/Extendable')
let accounts, contract

const mintSig = signatureOf('mintShares(address,uint64)')
const setReqSig = signatureOf('setApprovalRequirement(bytes4,uint8)')
const addSig = signatureOf('addExtension(address,bool,string[])')

const z32 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
const z20 = '0x0000000000000000000000000000000000000000';

const deploy = (address, shares, duration = 100, mintReq = 51, setReqReq = 51) => {
  const contract = new web3.eth.Contract(abi);
  return new Promise((resolve, reject) => contract
    .deploy({ data: bytecode, arguments: [shares, duration, [mintSig, setReqSig, addSig], [mintReq, setReqReq, 51]] })
      .send({ from: address, gas: 5700000, value: 100000000000000 })
        .on('receipt', (receipt) => {
          contract._address = receipt.contractAddress;
          resolve(contract)
        })
        .on('error', (e) => reject(e))
  );
}


const deployExtension = (address, src, interface) => {
  const contract = new web3.eth.Contract(interface);
  return new Promise((resolve, reject) => contract
    .deploy({ data: src }).send({ from: address, gas: 4700000 })
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
  it('Should add 5+5 in an extension function', async () => {
    const src = fs.readFileSync(path.join(__dirname, 'sol', 'Output.sol'), 'utf8')
    const compiled = solc.compile('Output', src)
    const outputSig = signatureOf('add(uint256,uint256)')
    const ext = new web3.eth.Contract(compiled.abi)// await deployExtension(accounts[0], compiled.bytecode, compiled.abi)
    let payload = contract.methods.addExtension({
      metaHash: z32,
      extensionAddress: z20,
      useDelegate: true,
      bytecode: compiled.bytecode,
      functionSignatures: [outputSig]
    }).encodeABI()
    await web3.eth.sendTransaction({ from: accounts[0], data: payload, gas: 4700000, to: contract._address })
    payload = contract.methods.setApprovalRequirement(outputSig, 50).encodeABI()
    await web3.eth.sendTransaction({ from: accounts[0], data: payload, gas: 4700000, to: contract._address })
    payload = ext.methods.add(5, 5).encodeABI()
    let receipt = await web3.eth.sendTransaction({ from: accounts[0], data: payload, gas: 4700000, to: contract._address })
    expect(parseInt(receipt.logs[1].data, 16)).to.eq(10)
  })

  /* describe('Opcode Restriction', () => {
    it('Should disallow delegatecall', async () => {
      const src = fs.readFileSync(path.join(__dirname, 'sol', 'Delegate.sol'), 'utf8')
      const compiled = solc.compile('Delegate', src)
      const ext = await deployExtension(accounts[0], compiled.bytecode, compiled.abi)
      const outputSig = signatureOf('add(uint256)')
      let payload = contract.methods.addExtension({
        metaHash: z32,
        extensionAddress: z20,
        useDelegate: true,
        bytecode: compiled.bytecode,
        functionSignatures: [outputSig]
      }).encodeABI()
      await web3.eth.sendTransaction({ from: accounts[0], data: payload, gas: 4700000, to: contract._address })
        .then(() => {throw new Error('Should have thrown')})
        .catch(err => {
          expect(err.message).to.eq('Returned error: VM Exception while processing transaction: revert ExeDAO: Bytecode not allowed')
        })
    })

    it('Should disallow sstore', async () => {
      const src = fs.readFileSync(path.join(__dirname, 'sol', 'SStore.sol'), 'utf8')
      const compiled = solc.compile('SStore', src)
      const ext = await deployExtension(accounts[0], compiled.bytecode, compiled.abi)
      const outputSig = signatureOf('add(uint256)')
      let payload = contract.methods.addExtension({
        metaHash: z32,
        extensionAddress: z20,
        useDelegate: true,
        bytecode: compiled.bytecode,
        functionSignatures: [outputSig]
      }).encodeABI()
      await web3.eth.sendTransaction({ from: accounts[0], data: payload, gas: 4700000, to: contract._address })
        .then(() => {throw new Error('Should have thrown')})
        .catch(err => {
          expect(err.message).to.eq('Returned error: VM Exception while processing transaction: revert ExeDAO: Bytecode not allowed')
        })
    })
  }) */

  /* 
  
   const propHash = web3.utils.soliditySha3({
      t: 'bytes',
      v: contract.methods.mintShares(accounts[1], 500).encodeABI()
    });
    await contract.methods.submitOrVote(propHash).send({ from: accounts[0], gas: 4700000 })*/
})