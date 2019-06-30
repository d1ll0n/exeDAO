const getInfo = require('./get-token-info')
const rpc = 'https://mainnet.infura.io/v3/694db1a88f814a29927305f7b98cf7a3'

getInfo(rpc, ['0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359']).then(console.log)