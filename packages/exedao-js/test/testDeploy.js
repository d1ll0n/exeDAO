const {expect} = require('chai');
const Web3 = require('web3');
const ganache = require('ganache-cli');
const web3 = new Web3(ganache.provider());
const deploy = require('../src/deploy');

let address, contract;
before(async () => {
  address = (await web3.eth.getAccounts())[0];
  contract = await deploy(web3, address);
})

describe('exedao.js deploy', () => {
  it('Should have deployed a contract', () => expect(contract._address).exist);

  it('Should have minted 1000 shares', async () => {
    const daoist = await contract.methods.getDaoist(address).call();
    expect(daoist.shares).to.eq('1000');
    const total = await contract.methods.getTotalShares().call();
    expect(total).to.eq('1000');
  })

  it('Should have initialized approval requirements', async () => {
    const {signatures, requirements} = require('../src/defaults');
    for (let i in signatures) {
      const sig = signatures[i];
      const req = requirements[i];
      expect(await contract.methods.getApprovalRequirement(sig).call()).to.eq(req)
    }
  })
})
