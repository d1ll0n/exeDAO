let solc = require('solc')
const path = require('path')
const fs = require('fs')

const findImports = (sourcesObj, importPath) => {
  const importObj = {
    contents: fs.readFileSync(path.join(__dirname, 'contracts', importPath), 'utf8')
  }
  sourcesObj[importPath] = importObj;
  return importObj;
}

const stripFileName = (filePath) => filePath.match(/(\w+\/)*([\w]*).sol/)[2];

const compile = (entryFile, src, returnAll, otherSources) => {
  const sources = {
    [ entryFile + '.sol' ]: {
      content: src
    },
    ...(otherSources || {})
  };
  
  const standardInput = {
    language: 'Solidity',
    sources,
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode", "evm.deployedBytecode"]
        }
      },
      optimizer: {
        enabled: true,
        runs: 200
      }
    },
  };
  const out = JSON.parse(solc.compile(
    JSON.stringify(standardInput),
    (importPath) => findImports(sources, importPath)
  ));
  fs.writeFileSync('./standard-input.json', JSON.stringify(standardInput, null, 2))
  if (out.errors && out.errors.length && out.errors.some(err => err.severity != 'warning')) {
    const toThrow = new Error('solc error, see "errors" property');
    toThrow.errors = out.errors;
    console.log(out.errors)
    throw toThrow;
  }
  const output = {};
  for (let filePath of Object.keys(out.contracts)) {
    const fileName = stripFileName(filePath)
    const {
      abi,
      evm: {
        bytecode: { object: bytecode },
        deployedBytecode: { object: deployedBytecode }
      }
    } = out.contracts[filePath][fileName];
    output[filePath] = {
      abi,
      bytecode: '0x' + bytecode,
      deployedBytecode: '0x' + deployedBytecode
    }
  }
  if (!returnAll) return output[entryFile + '.sol'];
  return output;
};

function setSolc(_solc) {
  solc = _solc
}

module.exports = {
  compile,
  setSolc
};