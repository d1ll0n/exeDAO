const {abi: baseAbi} = require('../build/abi');
const {abi: erc20Abi} = require('../build/erc20');

module.exports = class Contract {
  constructor(web3, address, contract) {
    this.web3 = web3;
    this._abi = baseAbi;
    const isAddress = typeof contract == 'string' || Buffer.isBuffer(contract)
    this.contract = isAddress ? new this.web3.eth.Contract(baseAbi, contract) : contract;
    this.address = address;
    this.erc20 = new this.web3.eth.Contract(erc20Abi)
  }

  get abi() { return this._abi; }

  set abi(abi) {
    this.contract.jsonInterface = abi;
    this._abi = abi;
  }

  addABI(abi) { this.abi = [...this.abi, ...abi]; }

  // BASIC CONTRACT INTERACTIONS
  call(method, ...args) { return this.contract.methods[method](...args).call(); }

  encodeERC20Call(method, ...args) {
    return this.erc20.methods[method](...args).encodeABI();
  }

  sendRaw(data, gas, value, to) {
    console.log({data,gas,value,to})
    return this.web3.eth.sendTransaction({
      from: this.address,
      data,
      gas: gas || undefined,
      value: value || undefined,
      to: to || this.contract._address 
    })
  }
  
  send(method, gas, value, ...args) {
    const data = this.contract.methods[method](...args).encodeABI();
    return this.sendRaw(data, gas, value)
    /* return this.contract.methods[method](...args)
      .send({ from: this.address, gas: gas || undefined, value: value || undefined }) */
  }

}
