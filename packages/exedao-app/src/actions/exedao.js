const parseAbi = (abi) => {
  const functionNames = [];
  const functions = {};
  for (let funcAbi of abi) {
    const {name, inputs, type, stateMutability, payable} = funcAbi;
    if (type != 'function' || stateMutability == 'view') continue;
    const signature = coder.encodeFunctionSignature(funcAbi);
    functionNames.push({name, signature})
    functions[signature] = {signature, name, inputs, payable, stateMutability, type}
  }
  return {functions, functionNames}
}

const abi = {
  "constant": false,
  "inputs": [{ "name": "wallet", "type": "address" }, { "name": "wallet2", "type": "uint256" }],
  "name": "addWalletAddress",
  "outputs": [],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
}