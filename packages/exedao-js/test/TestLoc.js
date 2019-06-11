const solc = require("solc");
const fs = require("fs");
const abi = require("web3-eth-abi").AbiCoder();
const TestLoc = fs.readFileSync("./TestLoc.sol", "utf8");

const input = JSON.stringify({
  language: "Solidity",
  sources: { "TestLoc.sol": { content: TestLoc } },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
        "": ["*"]
      }
    }
  }
});

const out = JSON.parse(solc.compile(input));
if (out.errors) console.log(out.errors);
console.log(Object.keys(out.sources));
/* const sigAdd = abi.encodeFunctionSignature("add(uint256,uint256)");
const sigSub = abi.encodeFunctionSignature("sub(uint256,uint256)"); */
const {
  sources,
  evm: {
    bytecode: { object: bytecode, sourceMap },
    deployedBytecode: { object: deployedBytecode }
  }
} = out.contracts["TestLoc.sol"]["TestLoc"];
console.log(deployedBytecode.length);
console.log(bytecode.length)
const offset = bytecode.length - deployedBytecode.length
console.log(bytecode.slice(0, offset))
/* console.log(sigAdd.slice(2));
console.log(bytecode.indexOf(sigAdd.slice(2)));
console.log(bytecode.indexOf(sigSub.slice(2))); */
