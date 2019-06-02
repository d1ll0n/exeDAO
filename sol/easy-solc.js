const solc = require('solc')
const path = require('path')
const fs = require('fs')

const findImports = (importPath) => ({
  contents: fs.readFileSync(path.join(__dirname, 'contracts', importPath), 'utf8')
})

const easySolc = (contractName, src) => {
  const out = JSON.parse(solc.compile(JSON.stringify({
    language: 'Solidity',
    sources: {
      [ contractName + '.sol' ]: {
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
  return {
    abi,
    bytecode: '0x' + bytecode,
    deployedBytecode: '0x' + deployedBytecode
  };
};

module.exports = easySolc;