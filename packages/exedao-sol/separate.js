const {abi, bytecode} = require('./build/exeDAO')
const fs = require('fs')
fs.writeFileSync('./abi.json', JSON.stringify({abi}))
fs.writeFileSync('./bytecode.json', JSON.stringify({bytecode}))