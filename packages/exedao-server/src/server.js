const handler = require('express')();
const app = require('http').createServer(handler);
const io = require('socket.io')(app);
const mh = require('multihashing-async');
const fs = require('fs');
const path = require('path');
const Auth = require('./auth')
const setup = require('./setup');
const rpcCall = require('kool-makerpccall');
const makeFreeLog = require('kool-freelog');
const url = require('url');
const { w3cwebsocket: WebSocket } = require('websocket');

const LOG_POLL_TIMEOUT = 2500;

const filesPath = path.join(__dirname, 'proposals');
if (!fs.existsSync(filesPath)) fs.mkdirSync(filesPath);
const filePath = proposalHash => path.join(filesPath, filePath(proposalHash))

const port = 8080 || process.env.port;

module.exports = async () => {
  const db = require('./db');
  const {web3, exedao, temporal} = await setup();
  const { host } = web3.currentProvider;
  const freelog = makeFreeLog(WebSocket, Promise, host === 'http://localhost:8545' ? 'ws://localhost:8545' : host.match('infura') ? url.parse(host).host.match(/(?:[a-zA-Z]+)|(?:\.)/g)[0]: url.format(Object.assign(url.parse(host), { protocol: url.parse(host).protocol === 'https://' ? 'wss://' : 'ws://' })))
  const auth = new Auth(db);

  app.listen(port);
  console.log(`exedao server listening on ${port}`)
  
  io.on('connection', (socket) => {
    socket.on('/pinProposalPrivate', async (proposal, cb) => {
      if (!socket.isAuthed) return cb({success: false, error: 'Must authenticate to upload proposal data'});
      const {method, args, solfile, description} = proposal;
      const proposalHash = exedao.hashProposal(method, ...args);
      const exists = await exedao.getProposal(proposalHash).then(p => p.yesVotes > 0);
      if (!exists) return cb({success: false, error: 'Must submit proposal to exeDAO before uploading'});
      const file = JSON.stringify({method,args,solfile,description});
      fs.writeFileSync(filePath(proposalHash), file);
      cb({success: true, proposalHash});
    })

    socket.on('/pinProposal', async (proposal, cb) => {
      if (!socket.isAuthed) return cb({success: false, error: 'Must authenticate to upload proposal data'});
      const {method, args, solfile, description} = proposal;
      const proposalHash = exedao.hashProposal(method, ...args);
      const exists = await exedao.getProposal(proposalHash).then(p => p.yesVotes > 0);
      if (!exists) return cb({success: false, error: 'Must submit proposal to exeDAO before uploading'});
      const boundHash = await exedao.getProposalIpfsHash(proposalHash);
      const file = JSON.stringify({method,args,solfile,description});
      const fileHash = await mh(file, 'sha3-256');
      if (fileHash.slice(4) != boundHash) return cb({success: false, error: 'Must submit original file pinned to exeDAO'});
      if (fs.existsSync(filePath(proposalHash))) return cb({success: false, error: 'Already pinned file'});
      fs.writeFileSync(filePath(proposalHash), file);
      const rs = fs.createReadStream(filePath(proposalHash));
      await temporal.uploadPublicFile(rs, 1);
      cb({success: true, fileHash});
    })

    socket.on('/getProposalPrivate', (proposalHash, cb) => {
      if (!socket.isAuthed) return cb({success: false, error: 'Must authenticate to upload proposal data'});
      const proposal = fs.readFileSync(filePath(proposalHash)).toString();
      cb({success: true, proposal});
    })

    socket.on('/putBuyRequest', async (address, description, cb) => {
      if (!(await exedao.getBuyRequest).amount > 0) return cb({success: false, error: 'Must submit request to exedao first'});
      const requests = JSON.parse(await db.get('requesters')) || [];
      requests.push(address);
      await db.put(`request-${address}`, description);
      await db.put('requesters', JSON.stringify(requests));
      cb({success: true});
    })

    socket.on('/getBuyRequest', async (address, cb) => {
      await db.get(`request-${address}`)
        .then(description => cb({success: true, description}))
        .catch(err => cb({success: false, error: err.message}));
    })

    socket.on('/getBuyRequests', async (cb) => {
      const requesters = JSON.parse(await db.get('requesters')) || [];
      const requests = [];
      for (let address of requesters) requests.push({address, description: await db.get(`request-${addr}`)});
      cb({success: true, requests});
    })

    socket.on('/getChallenge', async (address, cb) => {
      const shares = await exedao.getShares(address);
      if (shares < 1) return cb({success: false, error: 'Only daoists can authenticate'});
      return auth.setChallenge(address)
        .then(challenge => cb({challenge, success: true}))
        .catch(e => cb({error: e.message, success: false}));
    })

    socket.on('/authenticate', (address, signature, cb) =>
      auth.auth(address, signature)
        .then(isAuthed => {
          cb({success: isAuthed});
          socket.isAuthed = isAuthed;
          socket.address = address;
        })
        .catch(e => cb({error: e.message, success: false}))
    )

    socket.on('/refresh', async (cb) => {
      if (!socket.isAuthed) return cb({error: 'Not logged in', success: false})
      auth.refresh(socket.address)
        .then(timestamp => cb({timestamp, success: true}))
        .catch(e => cb({error: e.message, success: false}))
    })
  })
  let blockNumber = +await rpcCall(host, 'eth_blockNumber');
  while (true) {
    const newBlockNumber = +await rpcCall(host, 'eth_blockNumber');
    if (newBlockNumber > blockNumber) {
      blockNumber = newBlockNumber;
      (await freelog({
        to: exedao.contract._address,
        fromBlock: blockNumber + 1,
        toBlock: newBlockNumber,
        chunkSize: 1
      })).forEach((log) => {
        console.log(log);
        io.emit('/exedaoEvent', {
          event: log.event,
          data: log.returnValues,
          raw: log.raw.data,
          topics: log.raw.topics
        });
      });
      console.log('up to date with block: ' + newBlockNumber);
    }
    await new Promise((resolve) => setTimeout(resolve, LOG_POLL_TIMEOUT));
  }
    
  /* garbage
  exedao.contract.events.allEvents(evt => io.emit('/exedaoEvent', {
    event: evt.event, data: evt.returnValues,
    raw: evt.raw.data, topics: evt.raw.topics
  }));
 */
}
