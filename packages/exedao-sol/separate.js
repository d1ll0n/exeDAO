const {abi, bytecode} = require('./build/ExeDAO')
const fs = require('fs')
fs.writeFileSync('./abi.json', JSON.stringify({abi}))
fs.writeFileSync('./bytecode.json', JSON.stringify({bytecode}))