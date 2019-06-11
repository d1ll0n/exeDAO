const Web3 = require('web3');
const {abi} = require('../build/abi');
const {getFunctionInfo, votesNeeded} = require('./lib');

module.exports = class exeDAO {
  constructor(provider, userAddress, contractAddress) {
    this.web3 = new Web3(provider);
    this.contract = new this.web3.eth.Contract(abi, contractAddress);
    this.address = userAddress;
    this.functionEncoders = {};
    Object.keys(this.contract.methods).map(method => {
      this.functionEncoders[method] = (...args) => this.contract.methods[method](...args).encodeABI();
    })
  }

  async updateFunctions() {
    const extensions = await this.call('getExtensions');
    for (let extension of extensions) {
      const functions = extension.rawFunctions;
      for (let func of functions) {
        const {name, encodeCall} = getFunctionInfo(func);
        if (!this.functionEncoders[name]) this.functionEncoders[name] = encodeCall;
        if (!this[name]) this[name] = (gas, value, ...args) => this.sendProposal(name, gas, value, ...args)
      }
    }
  }

  // BASIC CONTRACT INTERACTIONS
  call(method, ...args) { return this.contract.methods[method](...args).call(); }
  sendRaw(data, gas, value) {
    return this.web3.eth.sendTransaction({
      from: this.address,
      data,
      gas: gas || undefined,
      value: value || undefined,
      to: this.contract._address 
    })
  }
  
  send(method, gas, value, ...args) {
    return this.contract.methods[method](...args)
      .send({ from: this.address, gas: gas || undefined, value: value || undefined })
  }

  async sendProposal(method, gas, value, ...args) {
    if (!this.functionEncoders[method]) throw new Error(`Could not find function encoder for ${method}`)
    const data = this.functionEncoders[method](...args);
    const proposalHash = this.web3.utils.soliditySha3({ t: 'bytes', v: data });
    const {yesVotes, noVotes, proposalIndex} = await this.getProposal(proposalHash);
    if (proposalIndex != '0') { /* proposal has index (already created / not canceled) */
      // Check if the proposal would be approved after voting for it.
      // If it would, send the full calldata.
      const signature = data.slice(0, 10);
      const requirement = await this.getProposalRequirement(signature);
      if (requirement == 0) throw new Error('Proposal requirement not set, try setProposalRequirement');
      const totalShares = await this.getTotalShares();
      const remainder = votesNeeded(requirement, totalShares, yesVotes, noVotes);
      const shares = await this.getShares(this.address);
      if (shares >= remainder) return this.sendRaw(data, gas, value);
    }
    return this.voteByHash(proposalHash, true, gas)
  }

  hashProposal(method, ...args) {
    const data = this.functionEncoders[method](...args);
    return this.web3.utils.soliditySha3({ t: 'bytes', v: data });
  }
  voteByHash(proposalHash, vote, gas) { return this.send('submitOrVote', gas, 0, proposalHash, vote); }
  requestShares(shares) { return this.send('requestShares', shares); }

  // getters
  getShares(address) { return this.call('daoists', address); }
  getTotalShares() { return this.call('totalShares'); }
  getProposalRequirement(funcsig) { return this.call('proposalRequirements', funcsig); }
  getProposal(proposalHash) { return this.call('getProposal', proposalHash); }
  getOpenProposals() { return this.call('getOpenProposals'); }
  getProposalIpfsHash(proposalHash) { return this.call('proposalIPFSHashes', proposalHash); }
  getBuyRequest(address) { return this.call('buyRequests', address); }
  
  // proposal functions
  mintShares(address, shares, gas) { return this.sendProposal('mintShares', gas, 0, address, shares); }
  setMinimumBuyRequestValue(minValue, gas) { return this.sendProposal('setMinimumRequestValue', gas, 0, minValue); }
  safeExecute(bytecode, gas) { return this.sendProposal('safeExecute', gas, 0, bytecode); }
  unsafeExecute(bytecode, gas) { return this.sendProposal('unsafeExecute', gas, 0, bytecode); }
  addExtension(address, useDelegate, functions, gas) {
    return this.sendProposal('addExtension', gas, 0, address, useDelegate, functions); 
  }
  removeExtension(address, gas) { return this.sendProposal('removeExtension', gas, 0, address); }
  setProposalRequirement(sig, req, gas) { return this.sendProposal('setProposalRequirement', gas, 0, sig, req); }
  submitWithIPFSHash(proposalHash, ipfsHash, gas) {
    return this.sendProposal('submitWithIPFSHash', gas, 0, proposalHash, ipfsHash); 
  }
}

/*
setMinimumRequestValue(uint)
safeExecute(bytes)
unsafeExecute(bytes)
executeBuyOffer(address)
addExtension(address,bool,string[])
removeExtension(uint)
mintShares(address,uint32)
setProposalRequirement(bytes4,uint8)
*/