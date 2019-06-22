const {startServer} = require('./server');
const setup = require('./setup');
const db = require('./lib/db');

// startServer().catch((err) => console.error(err.stack));

async function start() {
  const {web3, exedao, temporal} = await setup();
  await startServer({exedao, temporal, db})
}

start();