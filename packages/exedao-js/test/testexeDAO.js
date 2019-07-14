const {expect} = require('chai');
const Web3 = require('web3');
const ganache = require('ganache-cli');
const provider = ganache.provider();
const web3 = new Web3('http://localhost:8545');
const ExeDAO = require('../src/ExeDAO');
const deploy = require('../src/deploy');
const abi = require('web3-eth-abi').AbiCoder();
const { soliditySha3 } = require('web3-utils');

let accounts, address, contract, exedao, exedao2;
before(async () => {
  accounts = await web3.eth.getAccounts();
  address = accounts[0];
  contract = await deploy(web3, address);
  exedao = new ExeDAO(web3, address, contract._address);
  exedao2 = new ExeDAO(web3, accounts[1], contract._address);
  await exedao.updateRequirements();
  await exedao2.updateRequirements();
})

describe('exeDAO class', () => {
  it('Should check shares', async () => {
    const shares = await exedao.getShares(address);
    expect(shares).to.eq('1000')
  })
  
  it('Should vote on a proposal by its hash', async () => {
    const hash = exedao.hashProposal('mintShares', accounts[1], 500)
    await exedao.submitOrVote(hash, 200000);
    const {votes} = await exedao.getProposal(hash);
    expect(votes).to.eq('1000');
  })

  it('Should mint shares', async () => {
    await exedao.mintShares(accounts[1], 400, 200000);
    const shares = await exedao.getShares(accounts[1]);
    expect(shares).to.eq('1000')
  })

  it('Should send proposal hash if the proposal is not ready to be executed', async () => {
    await exedao.mintShares(accounts[1], 1, 200000);
    const beforeAddress = exedao.address;
    exedao.address = accounts[1];
    let promise = exedao.mintShares(accounts[2], 1, 200000);
    const { transactionHash } = await promise;
    exedao.address = beforeAddress;
    const {input} = await web3.eth.getTransaction(transactionHash);
    const voteByHashSig = web3.eth.abi.encodeFunctionSignature('submitOrVote(bytes32)');
    expect(input.slice(0,10)).to.eq(voteByHashSig);
  })

  it('Should send proposal calldata if the proposal is ready to be executed', async () => {
    const {transactionHash} = await exedao.mintShares(accounts[1], 1, 200000);
    const {input} = await web3.eth.getTransaction(transactionHash);
    const mintSharesSig = web3.eth.abi.encodeFunctionSignature('mintShares(address,uint64)');
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
    const ext = {
      metaHash: soliditySha3(JSON.stringify({ works: true })),
      extensionAddress: extension._address, 
      useDelegate: true,
      bytecode: '0x' + bytecode,
      functionSignatures: [soliditySha3('add(uint256,uint256)').substr(0, 10)]
    };
    await exedao.addExtension(ext, 2000000);
    exedao.address = accounts[1];
    await exedao.addExtension(ext, 2000000);
    exedao.address = accounts[0];
  })
  
  it('Should call an extension function', async () => {
    const sig = web3.eth.abi.encodeFunctionSignature('add(uint256,uint256)')
    await exedao.setApprovalRequirement(sig, '5', 200000)
    const addressBefore = exedao.address;
    exedao.address = accounts[1];
    await exedao.setApprovalRequirement(sig, '5', 200000)
    exedao.approvalRequirements[sig] = '5';
    exedao.address = addressBefore;
    exedao.contract.methods.add = (a, b) => ({
      encodeABI: () => abi.encodeFunctionCall({
        name: 'add',
          inputs: [{
            type: 'uint256',
            name: 'a'
          }, {
            type: 'uint256',
            name: 'b'
          }]
        }, [ a, b ])
    })
    exedao.add = (gas, value, ...args) => exedao.sendProposal('add', gas, value, ...args);
    const receipt = await exedao.add(1000000, 0, 5, 10)
    expect(parseInt(receipt.logs[1].data, 16)).to.eql(15)
  })

  it ('Should run safeExecute', async () => {
    const testSol = `pragma solidity 0.5.0;
    contract ExecuteAdd {
      event Added(uint c);
    
      function () external payable {
        emit Added(5);
      }
    }`;
    const compilerOptions = {
      settings: {
          optimizer: {
              enabled: true,
              runs: 200
          }
      },
      contractName: 'ExecuteAdd',
      sources: {
          'ExecuteAdd.sol': {
              content: testSol
          }
      },
      version: 'v0.5.0+commit.1d4f565a'
    };
    const {bytecode} = await exedao.compiler.compile(compilerOptions)
    const receipt = await exedao.safeExecute(bytecode, 300000)
    expect(parseInt(receipt.logs[1].data, 16)).to.eql(5)
    
  })

  it('Should run safeExecute after voteByHash', async () => {
    const testSol = `pragma solidity 0.5.0;
    contract ExecuteAdd {
      event Added(uint c);
    
      function () external payable {
        emit Added(5);
      }
    }`;
    const compilerOptions = {
      settings: {
          optimizer: {
              enabled: true,
              runs: 200
          }
      },
      contractName: 'ExecuteAdd',
      sources: {
          'ExecuteAdd.sol': {
              content: testSol
          }
      },
      version: 'v0.5.0+commit.1d4f565a'
    };
    const {bytecode} = await exedao.compiler.compile(compilerOptions)
    const propHash = exedao.hashProposal('safeExecute', bytecode);
    console.log(propHash)
    let receipt = await exedao.submitOrVote(propHash, 300000)
    receipt = await exedao.safeExecute(bytecode, 300000)
    console.log(receipt.events)
    expect(parseInt(receipt.logs[1].data, 16)).to.eql(5)
  })
})
