const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const HttpServer = require('./httpServer')
const AuthMiddleware = require('./authMiddleware')
const db = require('../lib/db');

const app = express();
// const server = http.Server(app);
// const io = socketIO(server);

async function startServer() {
  const secret = await db.getSecret();
  const middleware = new AuthMiddleware(secret);
  const httpServer = new HttpServer(db, app, middleware);
  const temporal = 
}