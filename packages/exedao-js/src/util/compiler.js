const wrapper = require('./solc/wrapper');

module.exports = class Compiler {
  constructor(solc) {
    if (solc) this.solc = solc;
    else if (typeof window != 'undefined') this.solc = wrapper(window.Module);
    // else this.solc = require('solc') //throw new Error('Must provide solc if not used in browser');
  }

  loadVersion(version) {
    return new Promise(
      (resolve, reject) =>
        this.solc.loadRemoteVersion(version,
          (err, solc) =>
            err ? reject(err) : resolve(solc)));
  }

  async compile({sources, settings, contractName, version}) {
    const input = {
      language: 'Solidity',
      sources,
      settings: {
        outputSelection: {
          '*': {
            '*': [ '*' ]
          }
        },
        ...settings
      }
    };
    let solc = this.solc;
    let semiver = this.solc.version().replace('.Emscripten.clang', '');
    if (semiver[0] == 'v') semiver = semiver.slice(1);
    console.log(semiver)
    if (version.slice(1) !== semiver) solc = await this.loadVersion(version);
    const out = JSON.parse(solc.compile(JSON.stringify(input)));
    if (out.errors && out.errors.length && out.errors.some(err => err.severity != 'warning')) {
      const toThrow = new Error('solc error, see "errors" property');
      toThrow.errors = out.errors;
      throw toThrow;
    }
    const {
      abi, evm: { bytecode: { object: bytecode } }
    } = out.contracts[contractName + '.sol'][contractName];
    return {abi, bytecode: '0x' + bytecode};
  }
}