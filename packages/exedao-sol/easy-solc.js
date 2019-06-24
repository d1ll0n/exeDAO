const solc = require('solc')
const path = require('path')
const fs = require('fs')

const findImports = (importPath) => {
  console.log(importPath)
  return {
    contents: fs.readFileSync(path.join(__dirname, 'contracts', importPath), 'utf8')
  }
}

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
    console.log(out)
    throw toThrow;
  }
  console.log(out)
  const output = {};
  for (let contractName of ['Shared', 'Extendable', 'exeDAO', 'Permissioned']) {
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