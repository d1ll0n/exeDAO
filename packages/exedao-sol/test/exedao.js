'use strict';

const abi = require('web3-eth-abi').AbiCoder();
const Transaction = require('ethereumjs-tx');
const makeRpcCall = require('kool-makerpccall/src/base');
const {
  toBuffer,
  bufferToHex
} = require('ethereumjs-util');

class OfflineWalletProvider {
  constructor(rpc, privateKey, XMLHttpRequest) {
    this.setPrivateKey(toBuffer(privateKey));
    this.setRPC(rpc);
    this._rpcCall = makeRpcCall(XMLHttpRequest || window.XMLHttpRequest);
  }
  setRPC(rpc) {
    this._rpc = rpc;
  }
  getRPC() {
    return this._rpc;
  }
  rpcCall(method, params) {
    return this._rpcCall(this.getRPC(), method, params);
  }
  setPrivateKey(privateKeyBuffer) {
    this._privateKeyBuffer = privateKeyBuffer;
  }
  getPrivateKey() {
    return this._privateKeyBuffer;
  }
  sendTransaction(o) {
    const tx = new Transaction(o);
    tx.sign(this.getPrivateKey());
    return this.rpcCall('eth_sendRawTransaction', [ bufferToHex(tx.serialize()) ]);
  }
}

class MetaMaskProvider {
  sendTransaction(o) {
    o = Object.assign({
      from: this.getFrom()
    }, o);
    return new Promise((resolve, reject) => window.ethereum.sendAsync({
      method: 'eth_sendTransaction',
      params: [ o ],
      from: window.ethereum.selectedAddress
    }, (err, txHash) => err ? reject(err) : resolve(txHash)));
  }
}

class ExeDaoClient {
  constructor(provider, contractAddress) {
    this.setProvider(provider);
    this.setContractAddress(contractAddress);
  }
  setContractAddress(contractAddress) {
    this._contractAddress = contractAddress;
  }
  getContractAddress() {
    return this._contractAddress;
  }
  setProvider(provider) {
    if (typeof provider.sendTransaction !== 'function') throw Error('Missing provider.sendTransaction implementation');
    this._provider = provider;
  }
  getProvider() {
    return this._provider;
  }
  sendTransaction(o) {
    return provider.sendTransaction(o);
  }
  addFields(o, omitTo) {
    o = Object.assign({}, o);
    if (typeof o.gasLimit !== 'undefined') o.gas = o.gasLimit;
    if (typeof o.gas !== 'undefined') o.gasLimit = o.gas;
    if (!omitTo) o.to = this.getContractAddress();
    return o;
  }
  safeExecute(bytecode, o) {
    o = this.addFields(o);
    return this.sendTransaction(Object.assign({
      data: abi.encodeFunctionCall({
        name: 'safeExecute',
        inputs: [{
          name: 'bytecode',
          type: 'bytes'
        }]
      } [ bytecode ])
    }, o));
  }
  unsafeExecute(bytecode, o) {
    o = this.addFields(o);
    return this.sendTransaction(Object.assign({
      data: abi.encodeFunctionCall({
        name: 'unsafeExecute',
        inputs: [{
          name: 'bytecode',
          type: 'bytes'
        }]
      } [ bytecode ])
    }, o));
  }
  addFunctions(functionAddress, isCall, funcSigs) {
    o = this.addFields(o);
    return this.sendTransaction(Object.assign({
      data: abi.encodeFunctionCall({
        name: 'addFunctions',
        inputs: [{
          name: 'functionAddress',
          type: 'address'
        }, {
          name: 'isCall',
          type: 'bool[]'
        }, {
          name: 'funcSigs',
          type: 'bytes4[]'
        }]
      }, [ functionAddress, isCall, funcSigs ])
    }, o));
  }
  removeFunction(funcSigs) {
    o = this.addFields(o);
    return this.sendTransaction(Object.assign({
      data: abi.encodeFunctionCall({
        name: 'removeFunctions',
        inputs: [{
          name: 'funcSigs',
          type: 'bytes4[]'
        }]
      }, [ funcSigs ])
    }, o));
  }
}

Object.assign(module.exports, {
  ExeDaoClient,
  OfflineWalletProvider,
  MetaMaskProvider
});
