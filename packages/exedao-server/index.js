var app = require('http').createServer(handler);
var io = require('socket.io')(app);
const { randomBytes } = require('crypto');
const sigUtil = require('eth-sig-util');
const db = require('level')('./.db');
const fs = require('fs');
const path = require('path');
const { AbiCoder } = require('web3-eth-abi');
const coder = new AbiCoder();
const dbGet = key => db.get(key).catch(e => null)

const port = 8080 || process.env.port;
app.listen(port)

/*
Proposal Data
- function name
- arguments
- if addFunctions or removeFunctions, solidity file
*/

const getChallengeParams = address => [
  { type: 'string', name: 'Message', value: `I certify that I am the owner of ${address}` },
  { type: 'bytes32', name: 'Verification ID', value: randomBytes(32).toString('hex') }
]

io.on('connection', (socket) => {
  socket.on('/login', (address, cb) => {
    socket.uaddress = address;
    socket.challenge = getChallengeParams(address)
    cb(socket.challenge)
  })
  socket.on('/verify', (sig, cb) => {
    if (!socket.uaddress || !socket.challenge || !sig) return cb(false)
    const recovered = sigUtil.recoverTypedSignature({ data: socket.challenge, sig: sig })
    if (recovered !== socket.uaddress) cb(false)
    socket.address = socket.uaddress;
    socket.uaddress = null;
    socket.challenge = null;
    cb(true)
  })
  socket.on('putProposal', (proposal, cb) => {

  })
})