const {abi: baseAbi} = require('../build/abi');

module.exports = class Contract {
  constructor(web3, address, contract) {
    this.web3 = web3;
    this._abi = baseAbi;
    const isAddress = typeof contract == 'string' || Buffer.isBuffer(contract)
    this.contract = isAddress ? new this.web3.eth.Contract(baseAbi, contract) : contract;
    this.address = address;
  }

  get abi() { return this._abi; }

  set abi(abi) {
    this.contract.jsonInterface = abi;
    this._abi = abi;
  }

  addABI(abi) { this.abi = [...this.abi, ...abi]; }

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

}