const {getFunctionInfo, votesNeeded} = require('./lib');
const {signatureOf} = require('./util/abi');
const {signatures: builtInFuncSigs} = require('./defaults');
const Contract = require('./contract');
const Hasher = require('./util/hasher');
const deploy = require('./deploy');
const Compiler = require('./util/compiler');
const API = require('./util/api');


module.exports = class exeDAO extends Contract {
  constructor(web3, userAddress, contract, apiUrl) {
    super(web3, userAddress, contract);
    this.hasher = new Hasher(web3);
    this.api = new API(web3, userAddress, apiUrl);
    this.approvalRequirements = {};
    this.functionDescriptions = {};
  }

  static async deploy(web3, address, options) {
    const contract = await deploy(web3, address, options);
    return new exeDAO(web3, address, contract);
  }

  get compiler() {
    if (!this._compiler) this._compiler = new Compiler();
    return this._compiler;
  }

  /* <LISTENERS> */
  async addExtensionListener() {
    const blockNumber = await this.web3.eth.getBlockNumber()
    this.contract.events.ExtensionAdded(
      {fromBlock: blockNumber},
      ({returnValues: {extensionIndex, metaHash}}) => {
        console.log(`Got extension added event -- index ${extensionIndex} | meta hash ${metaHash}`);
        this.updateExtension(metaHash)
    })
  }

  async addProposalListener(cb) {
    const blockNumber = await this.web3.eth.getBlockNumber()
    this.contract.events.ProposalSubmission(
      {fromBlock: blockNumber},
      ({returnValues: {proposalHash, metaHash}}) => {
        console.log(`Got proposal submission event -- proposal hash ${proposalHash} | meta hash ${metaHash}`);
    })
  }
  /* </LISTENERS> */

  /* <UPDATERS> */
  async updateExtension(metaHash) {
    const {abi, functionDescriptions} = await this.api.getFile(metaHash);
    this.addABI(abi);
    this.functionDescriptions = {...this.functionDescriptions, ...functionDescriptions};
    const funcSigs = abi.map(signatureOf);
    await this.updateRequirements(funcSigs);
  }

  async updateExtensions() {
    let _abi = [];
    const extensions = await this.call('getExtensions');
    for (let extension of extensions) {
      const {metaHash} = extension;
      const {abi, functionDescriptions} = await this.api.getFile(metaHash);
      this.functionDescriptions = {...this.functionDescriptions, ...functionDescriptions};
      _abi = _abi.concat(abi);
    }
    this.addABI(_abi);
    const funcSigs = _abi.map(signatureOf);
    await this.updateRequirements(funcSigs);
  }

  async updateRequirements(funcSigs) {
    funcSigs = funcSigs || [...this.abi.map(signatureOf)];
    const approvalRequirements = await this.getApprovalRequirements(funcSigs);
    approvalRequirements.forEach((requirement, i) => {
      const funcSig = funcSigs[i]
      this.approvalRequirements[funcSig] = requirement;
    })
  }
  /* </UPDATERS> */

  /* <UTILS> */
  hashProposal(method, ...args) {
    const data = this.contract.methods[method](...args).encodeABI();
    return this.hasher.sha3(data);
  }
  /* </UTILS> */

  /* <VERIFIERS> */
  verifyJsonHash(expectHash, obj) {
    const hash = this.hasher.jsonSha3(obj);
    return hash == expectHash;
  }

  async verifyProposalMeta(proposalHash, metadata, extMeta) {
    // verify calldata
    const calldataHash = this.hashProposal(metadata.function, ...metadata.arguments);
    if (calldataHash != proposalHash) throw new Error('Provided function and arguments do not match proposal hash');
    // verify metadata hash
    const expectMetaHash = await this.getProposalMetaHash(proposalHash);
    if (!this.verifyJsonHash(expectMetaHash, metadata)) throw new Error('Provided metadata does not match the hash on exeDAO');
    // verify bytecode
    if (!(await this.verifyBytecode(metadata))) throw new Error('Provided input does not compile to bytecode on contract');
    // verify extension metadata
    if (metadata.function == 'addExtension') {
      if (!this.verifyJsonHash(metadata.arguments[0], extMeta)) throw new Error('Extension metadata does not match extension.metaHash');
    }
  }

  async verifyBytecode(metadata) {
    const func = metadata.function;
    const args = metadata.arguments;
    let checkBytecode;
    if (func == 'addExtension') {
      const useDelegate = args[3];
      if (!useDelegate) return true;
      checkBytecode = args[2];
    } else if (func == 'safeExecute' || func == 'unsafeExecute') {
      checkBytecode = args[0];
    }
    if (checkBytecode) {
      const {abi, bytecode} = await this.compiler.compile(metadata);
      if (bytecode != checkBytecode) throw new Error('Extension metadata does not match extension.metaHash');
      return abi;
    }
    return true;
  }

  async verifyExtensionMeta(extensionMeta, index) {
    const metahash = this.hasher.jsonSha3(extensionMeta);
    const extension = await this.getExtension(index);
    return metahash == extension.metaHash;
  }
  /* </VERIFIERS> */

  /* async updateFunctions() {
    const extensions = await this.call('getExtensions');
    for (let extension of extensions) {
      const functions = extension.rawFunctions;
      for (let func of functions) {
        const {name, encodeCall} = getFunctionInfo(func);
        if (!this.functionEncoders[name]) this.functionEncoders[name] = encodeCall;
        if (!this[name]) this[name] = (gas, value, ...args) => this.sendProposal(name, gas, value, ...args)
      }
    }
  } */


  /* <GETTERS> */
  getShares(address) { return this.call('daoists', address); }
  getTotalShares() { return this.call('totalShares'); }
  getApprovalRequirement(funcsig) { return this.call('approvalRequirements', funcsig); }
  getApprovalRequirements(funcsigs) { return this.call('getApprovalRequirements', funcsigs); }
  getProposal(proposalHash) { return this.call('getProposal', proposalHash); }
  getOpenProposals() { return this.call('getOpenProposals'); }
  getProposalMetaHash(proposalHash) { return this.call('proposalMetaHashes', proposalHash); }
  getBuyRequest(address) { return this.call('buyRequests', address); }
  getExtension(index) { return this.call('extensions', index); }
  getExtensions() { return this.call('getExtensions'); }
  /* </GETTERS> */

  /* <PROPOSALS> */
  voteByHash(proposalHash, gas) { return this.send('submitOrVote', gas, 0, proposalHash); }
  requestShares(shares) { return this.send('requestShares', shares); }
  async sendProposal(method, gas, value, ...args) {
    if (!this.contract.methods[method]) throw new Error(`No method for ${method}`);
    const data = this.contract.methods[method](...args).encodeABI();
    const proposalHash = this.hasher.sha3(data);
    let {votes, proposalIndex} = await this.getProposal(proposalHash);
    if (proposalIndex == '0') votes = 0;
    const signature = data.slice(0, 10);
    const requirement = this.approvalRequirements[signature];
    if (requirement == 0) throw new Error('Approval requirement not set, try setApprovalRequirement');
    const totalShares = await this.getTotalShares();
    const remainder = votesNeeded(requirement, totalShares, votes);
    const shares = await this.getShares(this.address);
    if (shares >= remainder) return this.sendRaw(data, gas, value);
    return this.voteByHash(proposalHash, gas)
  }

  mintShares(address, shares, gas) { return this.sendProposal('mintShares', gas, 0, address, shares); }
  setMinimumBuyRequestValue(minValue, gas) { return this.sendProposal('setMinimumRequestValue', gas, 0, minValue); }
  safeExecute(bytecode, gas) { return this.sendProposal('safeExecute', gas, 0, bytecode); }
  unsafeExecute(bytecode, gas) { return this.sendProposal('unsafeExecute', gas, 0, bytecode); }
  addExtension(extension, gas) { return this.sendProposal('addExtension', gas, 0, extension); }
  removeExtension(address, gas) { return this.sendProposal('removeExtension', gas, 0, address); }
  setApprovalRequirement(sig, req, gas) { return this.sendProposal('setApprovalRequirement', gas, 0, sig, req); }
  submitWithMetaHash(proposalHash, metaHash, gas) {
    return this.sendProposal('submitWithMetaHash', gas, 0, proposalHash, metaHash); 
  }
  /* </PROPOSALS> */
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
