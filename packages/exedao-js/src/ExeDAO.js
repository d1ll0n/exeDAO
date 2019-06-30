const {votesNeeded} = require('./util/exedao');
const {signatureOf} = require('./util/abi');
const Contract = require('./contract');
const Hasher = require('./util/hasher');
const deploy = require('./deploy');
const Compiler = require('./util/compiler');
const API = require('./util/api');
const {functionDescriptions} = require('./defaults');
// const mhA = require('multihashing-async')



module.exports = class ExeDAO extends Contract {
  constructor(web3, userAddress, contract, apiUrl) {
    super(web3, userAddress, contract);
    this.hasher = new Hasher(web3);
    this.api = new API(web3, userAddress, apiUrl);
    this.approvalRequirements = {};
    this.functionDescriptions = functionDescriptions;
  }

  static async deploy(web3, address, options) {
    const contract = await deploy(web3, address, options);
    return new ExeDAO(web3, address, contract);
  }

  getFuncCallDetails(funcSig, args) {
    const {inputs, name: functionName} = this.abi.filter(({signature}) => signature == funcSig)[0];
    const parsedArgs = [];
    for (let i in args) parsedArgs[i] = {value: args[i], name: inputs[i].name, type: inputs[i].type};
    const functionSelector = `${functionName}(${inputs.map(i => i.type).join(',')})`
    return {functionName, functionSelector, parsedArgs};
  }

  async init() {
    await this.updateRequirements();
    this.totalShares = await this.getTotalShares();
    this.ownedShares = this.address ? await this.getShares(this.address) : 0;
    this.tokens = await this.getTokens();
    this.balance = await this.web3.eth.getBalance(this.contract._address);
    this.buyRequests = await this.getOpenBuyRequests();
    this.daoists = await this.getDaoists();
  }

  get compiler() {
    if (!this._compiler) this._compiler = new Compiler();
    return this._compiler;
  }

  /* <LISTENERS> */
  async addListener(eventName, cb) {
    const blockNumber = await this.web3.eth.getBlockNumber()
    this.contract.events[eventName]({fromBlock: blockNumber})
      .on('data', ({returnValues: data}) => {
        console.log(`Got ${eventName} event ${data}`);
        cb(data)
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
    return this.hasher.sha3Bytes(data);
  }
  /* </UTILS> */

  /* <VERIFIERS> */
  verifyJsonHash(expectHash, obj) {
    const hash = this.hasher.jsonSha3(obj);
    const valid = hash == expectHash;
    if (!valid) {
      console.log(typeof obj)
      console.log(obj)
      console.log('real hash - ', hash)
      console.log('expected hash - ', expectHash)
    }
    return valid;
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

  verifyBuyRequestMeta(applicantAddress, name, description) {
    const {metaHash} = this.getBuyRequest(applicantAddress);
    return this.verifyJsonHash(metaHash, {name, description});
  }

  async verifyBytecode(metadata) {
    const func = metadata.function;
    const args = metadata.arguments;
    let checkBytecode;
    if (func == 'addExtension') {
      const useDelegate = args[3];
      if (!useDelegate) return true;
      checkBytecode = args[2];
    } else if (func == 'safeExecute') {
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

  /* <GETTERS> */
  getDaoist(address) { return this.call('getDaoist', address); }
  getDaoists() { return this.call('getDaoists'); }

  getToken(address) { return this.call('getToken', address); }
  getTokens() { return this.call('getTokens'); }

  getShares(address) { return this.call('getDaoist', address).then(daoist => daoist.shares); }
  getTotalShares() { return this.call('getTotalShares'); }
  
  getApprovalRequirement(funcsig) { return this.call('getApprovalRequirement', funcsig); }
  getApprovalRequirements(funcsigs) { return this.call('getApprovalRequirements', funcsigs); }
  
  getProposal(proposalHash) { return this.call('getProposal', proposalHash); }
  getOpenProposals() { return this.call('getOpenProposals'); }
  getProposalMetaHash(proposalHash) { return this.call('getProposalMetaHash', proposalHash); }
  
  getBuyRequest(address) { return this.call('getBuyRequest', address); }
  getOpenBuyRequests() { return this.call('getOpenBuyRequests'); }

  getExtension(index) { return this.call('getExtension', index); }
  getExtensions() { return this.call('getExtensions'); }
  
  async getMetaData(metaHash) {
    const metadata = await this.api.getFile(metaHash)
    const valid = await this.verifyJsonHash(metaHash, metadata)
    if (valid) return metadata;
    else throw new Error('Could not verify hash')
  }
  /* </GETTERS> */

  /* <PROPOSALS> */
  acceptBuyRequest(applicant, gas) { return this.send('executeBuyRequest', gas, 0, applicant); }
  cancelBuyRequest(gas) { return this.send('executeBuyRequest', gas, 0, this.address); }
  submitOrVote(proposalHash, gas) { return this.send('submitOrVote', gas, 0, proposalHash); }
  async requestShares({shares, wei, tokens = [], name, description}, gas) {
    for (let token of tokens) {
      const {tokenAddress, value} = token;
      const calldata = this.encodeERC20Call('approve', this.contract._address, value);
      await this.sendRaw(calldata, null, 0, tokenAddress);
    }
    const metaHash = this.hasher.jsonSha3({name, description})
    return this.send('requestShares', gas, wei, metaHash, shares, tokens);
  }
  async sendProposal(method, gas, value, ...args) {
    if (!this.contract.methods[method]) throw new Error(`No method for ${method}`);
    const data = this.contract.methods[method](...args).encodeABI();
    const proposalHash = this.hasher.sha3Bytes(data);
    let {votes, proposalIndex} = await this.getProposal(proposalHash);
    if (proposalIndex == '0') votes = 0;
    const signature = data.slice(0, 10);
    console.log(signature)
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
  addExtension(extension, gas) { return this.sendProposal('addExtension', gas, 0, extension); }
  removeExtension(address, gas) { return this.sendProposal('removeExtension', gas, 0, address); }
  setApprovalRequirement(sig, req, gas) { return this.sendProposal('setApprovalRequirement', gas, 0, sig, req); }
  submitWithMetaHash(proposalHash, metaHash, gas) {
    return this.send('submitWithMetaHash', gas, 0, proposalHash, metaHash); 
  }
  addToken(tokenAddress, gas) { return this.sendProposal('addToken', gas, 0, tokenAddress); }
  approveTokenTransfer(tokenAddress, spender, amount, gas) {
    return this.sendProposal('approveTokenTransfer', gas, 0, tokenAddress, spender, amount);
  }
  transferToken(tokenAddress, recipient, amount, gas) {
    return this.sendProposal('transferToken', gas, 0, tokenAddress, recipient, amount);
  }
  receiveToken(tokenAddress, sender, amount, gas) {
    return this.sendProposal('receiveToken', gas, 0, tokenAddress, sender, amount);
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
