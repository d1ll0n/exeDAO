const solc = require('solc')
const path = require('path')
const fs = require('fs')

const findImports = (importPath) => ({
  contents: fs.readFileSync(path.join(__dirname, 'contracts', importPath), 'utf8')
})

const easySolc = (entryFile, src, returnAll) => {
  const out = JSON.parse(solc.compile(JSON.stringify({
    language: 'Solidity',
    sources: {
      [ entryFile + '.sol' ]: {
        content: src
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': [ '*' ]
        }
      },
      optimizer: {
        enabled: true
      }
    }
  }), findImports));
  if (out.errors && out.errors.length && out.errors.some(err => err.severity != 'warning')) {
    const toThrow = new Error('solc error, see "errors" property');
    toThrow.errors = out.errors;
    console.log(out.errors)
    throw toThrow;
  }
  const output = {};
  for (let contractName of Object.keys(out.contracts).map(k => k.replace('.sol', ''))) {
    const {
      abi,
      evm: {
        bytecode: {
          object: bytecode
        },
        deployedBytecode: {
          object: deployedBytecode
        }
      }
    } = out.contracts[contractName + '.sol'][contractName];
    output[contractName] = {
      abi,
      bytecode: '0x' + bytecode,
      deployedBytecode: '0x' + deployedBytecode
    }
  }
  if (!returnAll) return output[entryFile];
  return output;
};

module.exports = easySolc;