const {votesNeeded} = require('./util/exedao');
const {signatureOf} = require('./util/abi');
const Contract = require('./contract');
const Hasher = require('./util/hasher');
const deploy = require('./deploy');
const Compiler = require('./util/compiler');
const API = require('./util/api');
const {functionDescriptions} = require('./defaults');
const {getTokenInfo, getTokensInfo} = require('./get-token-info')
const TokenGetter = require('./util/TokenGetter')
const {stripDecimals} = require('./util')

module.exports = class ExeDAO extends Contract {
  constructor(web3, userAddress, contract, apiUrl, rpcUrl) {
    super(web3, userAddress, contract);
    this.hasher = new Hasher(web3);
    this.api = new API(web3, userAddress, apiUrl);
    this.approvalRequirements = {};
    this.functionDescriptions = functionDescriptions;
    this.rpcUrl = rpcUrl || 'https://mainnet.infura.io/v3';
    this.tokenGetter = new TokenGetter(this.web3);
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
    this.ownedShares = this.address ? await this.getShares(this.address).catch(() => 0) : 0;
    this.tokens = await this.getTokensWithInfo() //this.getTokens();
    this.balance = await this.web3.eth.getBalance(this.contract._address);
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
    funcSigs = funcSigs || this.abi.map(signatureOf);
    const approvalRequirements = await this.getApprovalRequirements([...funcSigs]).catch(e => console.log(`got error ${e.message}`));
    approvalRequirements.forEach((requirement, i) => {
      const funcSig = funcSigs[i]
      this.approvalRequirements[funcSig] = requirement;
    })
  }
  /* </UPDATERS> */

  /* <UTILS> */
  hashProposal(method, ...args) {
    const data = this.contract.methods[method](...args).encodeABI();
    console.log({hashData: data})
    return this.hasher.sha3Bytes(data);
  }
  /* </UTILS> */

  /* <VERIFIERS> */
  verifyJsonHash(expectHash, obj) {
    const hash = this.hasher.jsonSha3(obj);
    const valid = hash == expectHash;
    if (!valid) {
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

  async verifyApplication(applicant, application) {
    const {metaHash} = await this.getApplication(applicant);
    if (!this.verifyJsonHash(metaHash, application)) throw new Error(`Application hash does not match: expected ${metaHash}`)
  }
  /* </VERIFIERS> */

  /* <SCRAPER> */
  getTokenInfo(address) { return this.tokenGetter.getTokenInfo(address) }
  getTokensInfo(addresses) { return addresses.map(async address => await this.getTokenInfo(address)) }
  /* </SCRAPER> */

  /* <GETTERS> */
  getDaoist(address) { return this.call('getDaoist', address); }
  getDaoists() { return this.call('getDaoists'); }

  getToken(address) { return this.call('getToken', address); }
  getTokens() { return this.call('getTokens'); }

  async getTokensWithInfo() {
    return await this.getTokens()
      .then(tokens => Promise.all(tokens.map(
        async (token) => {
          const info = await this.getTokenInfo(token.tokenAddress);
          const {decimals} = info;
          if (decimals) token.value = stripDecimals(token.value, decimals) / 1e18
          return {...token, ...info}
        }
      )));
  }

  getShares(address) { return this.call('getDaoist', address).then(daoist => daoist.shares); }
  getTotalShares() { return this.call('getTotalShares'); }
  
  getApprovalRequirement(funcsig) { return this.call('getApprovalRequirement', funcsig); }
  getApprovalRequirements(funcsigs) { return this.call('getApprovalRequirements', funcsigs); }
  
  getProposal(proposalHash) { return this.call('getProposal', proposalHash); }
  getOpenProposals() { return this.call('getOpenProposals'); }
  getProposalMetaHash(proposalHash) { return this.call('getProposalMetaHash', proposalHash); }
  
  getApplication(address) {
    return this.call('getApplication', address)
      .then((application) => {
        if (application.applicant == '0x0000000000000000000000000000000000000000') return null;
        application.tokenTributes = application.tokenTributes.map(
          (tokenAddress, i) => ({tokenAddress, value: application.tokenTributeValues[i]}));
        application.proposalHash = this.hashProposal('executeApplication', application.applicant);
        return application;
      }); 
  }
  
  getOpenApplications() {
    return this.call('getOpenApplications')
      .then((applications) => {
        if (!applications) return null;
        for (let application of applications) {
          application.proposalHash = this.hashProposal('executeApplication', application.applicant);
          application.tokenTributes = application.tokenTributes.map(
            (tokenAddress, i) => ({tokenAddress, value: application.tokenTributeValues[i]}));
        }
        return applications.filter(app => app.shares != '0')
      });
  }

  getExtension(index) { return this.call('getExtension', index); }
  getExtensions() { return this.call('getExtensions'); }
  
  async getMetaData(metaHash) {
    const metadata = await this.api.getFile(metaHash)
    const valid = await this.verifyJsonHash(metaHash, metadata)
    if (valid) return metadata;
    else throw new Error('Could not verify hash')
  }
  /* </GETTERS> */

  /* <APPLICATIONS> */
  acceptApplication(applicant, gas) { return this.sendProposal('executeApplication', gas, 0, applicant); }

  cancelApplication(gas) { return this.send('executeApplication', gas, 0, this.address); }

  async submitApplication({shares, weiTribute: wei, tokenTributes: tokens = [], name, description}, gas) {
    for (let token of tokens) {
      const {tokenAddress, value} = token;
      const calldata = this.encodeERC20Call('approve', this.contract._address, value);
      await this.sendRaw(calldata, null, 0, tokenAddress);
    }
    const metaHash = this.hasher.jsonSha3({name, description})
    return this.send('submitApplication', gas, wei, metaHash, shares, tokens);
  }
  /* </APPLICATIONS> */

  /* <PROPOSAL UTILS> */
  submitOrVote(proposalHash, gas) { return this.send('submitOrVote', gas, 0, proposalHash); }

  async sendProposal(method, gas, value, ...args) {
    if (!this.contract.methods[method]) throw new Error(`No method for ${method}`);
    const data = this.contract.methods[method](...args).encodeABI();
    const proposalHash = this.hasher.sha3Bytes(data);
    let {votes} = await this.getProposal(proposalHash).catch(() => ({votes: 0}));
    const signature = data.slice(0, 10);
    const requirement = this.approvalRequirements[signature];
    if (requirement == 0) throw new Error('Approval requirement not set, try setApprovalRequirement');
    const totalShares = await this.getTotalShares();
    const remainder = votesNeeded(requirement, totalShares, votes);
    const shares = await this.getShares(this.address);
    // console.log(`Sending proposal ${method} ${args}`)
    if (shares >= remainder) {
      // console.log(`Sending raw ${data}`)
      const receipt = await this.sendRaw(data, gas, value);
      // console.log(receipt)
      return receipt;
    }
    // console.log(`Sending vote by hash`)
    const receipt = await this.submitOrVote(proposalHash, gas);
    // console.log(receipt);
    return receipt;
  }

  submitWithMetaHash(proposalHash, metaHash, gas) {
    return this.send('submitWithMetaHash', gas, 0, proposalHash, metaHash); 
  }
  /* </PROPOSAL UTILS> */

  /* <DAO MANAGEMENT PROPOSALS> */
  burnShares(shares, gas) { return this.send('burnShares', gas, 0, shares); }
  setMinimumTribute(minValue, gas) { return this.sendProposal('setMinimumRequestValue', gas, 0, minValue); }
  setApprovalRequirement(sig, req, gas) { return this.sendProposal('setApprovalRequirement', gas, 0, sig, req); }
  mintShares(address, shares, gas) { return this.sendProposal('mintShares', gas, 0, address, shares); }
  addExtension(extension, gas) { return this.sendProposal('addExtension', gas, 0, extension); }
  removeExtension(address, gas) { return this.sendProposal('removeExtension', gas, 0, address); }
  addToken(tokenAddress, gas) { return this.sendProposal('addToken', gas, 0, tokenAddress); }
  /* </DAO MANAGEMENT PROPOSALS> */

  /* <PROPOSALS> */
  safeExecute(bytecode, gas) { return this.sendProposal('safeExecute', gas, 0, bytecode); }
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
