const express = require('express');
// const http = require('http');
// const socketIO = require('socket.io');
// const server = http.Server(app);
// const io = socketIO(server);

const {certPath, keyPath, PORT} = process.env;

const HttpServer = require('./httpServer')
const AuthMiddleware = require('./authMiddleware')

const app = express();

async function startServer({temporal, db, exedao}) {
  const secret = await db.getSecret();
  const middleware = new AuthMiddleware(secret, exedao);
  const httpServer = new HttpServer(app, middleware, exedao, temporal, db);
  if (PORT == 443 && certPath && keyPath) require('./redirectServer')
  await httpServer.start();
}

module.exports = {startServer};