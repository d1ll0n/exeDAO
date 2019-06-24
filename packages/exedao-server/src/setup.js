require('dotenv').config();
const Web3 = require('web3');
const {exeDAO} = require('exedao-js');
const Temporal = require('./lib/temporal');
// const rpcCall = require('kool-makerpccall');

let {contractAddress, ethnet, temporaluser, temporalpass} = process.env;
const provider = ethnet == 'ganache'
  ? 'http://localhost:8545' : `wss://${ethnet}.infura.io/ws/v3`;

const web3 = new Web3(provider);

/*
{
  await exeDAO.deploy(web3, accounts[0])
  const deployTxHash = await deploy(web3, accounts[0]);
  while (true) {
    const receipt = await rpcCall(web3.currentProvider.host, 'eth_getTransactionReceipt', [ deployTxHash ]);
    if (receipt && receipt.contractAddress) {
      contractAddress = receipt.contractAddress;
      console.log(`contract -- ${contractAddress}`)
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 2500));
  }
}
const exedao = new exeDAO(provider, accounts[0], contractAddress);
*/
module.exports = async () => {
  const temporal = new Temporal(temporaluser, temporalpass);
  await temporal.login(temporaluser, temporalpass);
  let accounts = await web3.eth.getAccounts();
  let exedao
  if (!contractAddress) exedao = await exeDAO.deploy(web3, accounts[0]);
  else exedao = new exeDAO(web3, accounts[0], contractAddress);
  
  console.log('exedao address -- ', exedao.contract._address);
  // Remove this next bit, just for testing
  
  return {provider, web3, exedao, temporal};
}

