const express = require('express');
// const http = require('http');
// const socketIO = require('socket.io');
// const server = http.Server(app);
// const io = socketIO(server);

const HttpServer = require('./httpServer')
const AuthMiddleware = require('./authMiddleware')

const app = express();

async function startServer({temporal, db, exedao}) {
  const secret = await db.getSecret();
  const middleware = new AuthMiddleware(secret, exedao);
  const httpServer = new HttpServer(app, middleware);
  await httpServer.start({temporal, db, exedao})
}

module.exports = {startServer};