const {expect} = require('chai');
const Web3 = require('web3');
const ganache = require('ganache-cli');
const provider = ganache.provider();
const web3 = new Web3(provider);
const exeDAO = require('../src/exeDAO');
const deploy = require('../src/deploy');

let accounts, address, contract, exedao, exedao2;
before(async () => {
  accounts = await web3.eth.getAccounts();
  address = accounts[0];
  contract = await deploy(web3, address);
  exedao = new exeDAO(web3, address, contract._address);
  exedao2 = new exeDAO(web3, accounts[1], contract._address);
})

describe('exeDAO class', () => {
  it('Should check shares', async () => {
    const shares = await exedao.getShares(address);
    expect(shares).to.eq('1000')
  })

  it('Should vote on a proposal by its hash', async () => {
    const hash = exedao.hashProposal('mintShares', accounts[1], 500)
    await exedao.voteByHash(hash, true, 200000);
    const {yesVotes} = await exedao.getProposal(hash);
    expect(yesVotes).to.eq('1000');
  })

  it('Should mint shares', async () => {
    await exedao.mintShares(accounts[1], 500, 200000);
    const shares = await exedao.getShares(accounts[1]);
    expect(shares).to.eq('500')
  })

  it('Should send proposal hash if the proposal is not ready to be executed', async () => {
    const {transactionHash} = await exedao.mintShares(accounts[1], 500, 200000);
    const {input} = await web3.eth.getTransaction(transactionHash);
    const voteByHashSig = web3.eth.abi.encodeFunctionSignature('submitOrVote(bytes32,bool)');
    expect(input.slice(0,10)).to.eq(voteByHashSig);
  })
  
  it('Should send proposal calldata if the proposal is ready to be executed', async () => {
    const {transactionHash} = await exedao2.mintShares(accounts[1], 500, 200000);
    const {input} = await web3.eth.getTransaction(transactionHash);
    const mintSharesSig = web3.eth.abi.encodeFunctionSignature('mintShares(address,uint32)');
    expect(input.slice(0,10)).to.eq(mintSharesSig);
  })

  it('Should update function encoders with extensions', async () => {
    const solc = require('solc');
    const OutputSol = `pragma solidity ^0.5.5; contract Output { event Addition(uint c);` +
    `function add(uint256 a, uint256 b) external { emit Addition(a + b); } }`
    const input = JSON.stringify({
      language: 'Solidity',
      sources: {'Output.sol': {content: OutputSol}},
      settings: { outputSelection: { '*': { '*': [ '*' ] } } }
    })
    const out = JSON.parse(solc.compile(input))
    const { abi, evm: { bytecode: { object: bytecode } } } = out.contracts['Output.sol']['Output'];
    const extension = await new web3.eth.Contract(abi).deploy({ data: bytecode, arguments: [] }).send({ from: address, gas: 4700000 })
    await exedao.addExtension(extension._address, true, ['add(uint256,uint256)'], 200000)
    await exedao2.addExtension(extension._address, true, ['add(uint256,uint256)'], 200000)
    await exedao.updateFunctions()
    expect(exedao.functionEncoders.add).exist
  })

  it('Should call an extension function', async () => {
    const sig = web3.eth.abi.encodeFunctionSignature('add(uint256,uint256)')
    await exedao.setProposalRequirement(sig, '1', 200000)
    await exedao2.setProposalRequirement(sig, '1', 200000)
    await exedao.add(100000, 0, 5, 10)
    await exedao2.updateFunctions()
    const receipt = await exedao2.add(100000, 0, 5, 10)
    expect(parseInt(receipt.logs[2].data, 16)).to.eql(15)
  })
})