require('dotenv').config();
const Web3 = require('web3');
const {ExeDAO} = require('exedao-js');
const Temporal = require('./lib/temporal');
// const rpcCall = require('kool-makerpccall');

let {contractAddress, ethnet, temporaluser, temporalpass} = process.env;
const provider = ethnet == 'ganache'
  ? 'http://localhost:8545' : `wss://${ethnet}.infura.io/ws/v3`;

const web3 = new Web3(provider);

module.exports = async () => {
  const temporal = new Temporal(temporaluser, temporalpass);
  await temporal.login(temporaluser, temporalpass);
  let accounts = await web3.eth.getAccounts();
  let exedao
  if (!contractAddress) exedao = await ExeDAO.deploy(web3, accounts[0]);
  else exedao = new ExeDAO(web3, accounts[0], contractAddress);
  console.log(exedao.contract._address)
  if (ethnet == 'ganache') {
    const erc20 = await require('../test/erc20')(web3, accounts[1])
    await erc20.methods.getTokens(5000).send({from: accounts[1], gas: 450000})
    // await erc20.methods.approve(exedao.contract._address, 2500).send({from: accounts[1], gas: 450000})
    // console.log(`${accounts[1]} has 5000 tokens and has approved exeDAO to withdraw`)
    console.log(`Deployed ERC20 Token: ${erc20._address}`)
  }
  
  console.log('exedao address -- ', exedao.contract._address);
  // Remove this next bit, just for testing
  
  return {provider, web3, exedao, temporal};
}

