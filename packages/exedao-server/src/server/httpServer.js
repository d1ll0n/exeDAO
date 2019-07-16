const bodyParser = require('body-parser');
const cors = require('cors')
const express = require('express')
const https = require('https')
const fs = require('fs');
const compress = require('compression')
const path = require('path');

const {detJson, toCid} = require('../lib/files')
const {getFile, putApplication, putProposal} = require('./routes')

const filesPath = path.join(__dirname, '..', 'data');
if (!fs.existsSync(filesPath)) fs.mkdirSync(filesPath);

const {certPath, keyPath, PORT} = process.env;

const toPath = fileHash => path.join(filesPath, fileHash.toString('hex'));
const sendIndex = (_, res) => res.sendFile(path.join(__dirname, './public/index.html'))

module.exports = class HttpServer {
  constructor(app, middleware, exedao, temporal, db) {
    this.app = app;
    this.authMiddleware = middleware
    this.getFile = getFile.bind(this)
    this.putApplication = putApplication.bind(this)
    this.putProposal = putProposal.bind(this)
    this.exedao = exedao;
    this.temporal = temporal;
    this.db = db;
  }

  async readFile(fileHash) {
    let filePath = toPath(fileHash);
    if (!fs.existsSync(filePath)) {
      let cidHash = await toCid(fileHash);
      filePath = toPath(cidHash)
      if (!fs.existsSync(filePath)) throw new Error('File not found')
    }
    return fs.readFileSync(filePath, 'utf8')
  }

  async saveFile(data, membersOnly) {
    const file = detJson(data);
    if (file.length > 51200) throw new Error('File too large. Maximum size: 50kb')
    const metahash = this.exedao.hasher.jsonSha3(data)
    const fileHash = await toCid(metahash);
    const filePath = toPath(fileHash);
    membersOnly = membersOnly == 'true' || membersOnly == true;
    if (fs.existsSync(filePath)) throw new Error('File already uploaded.')
    fs.writeFileSync(filePath, Buffer.from(file));
    if (!membersOnly) {
      console.log('Uploading to Temporal')
      const rs = fs.createReadStream(filePath);
      const ret = await this.temporal.uploadPublicFile(rs, 1);
      console.log('temporal response -- ', ret)
      console.log(`https://gateway.temporal.cloud/ipfs/${ret}`)
    }
    return fileHash;
  }

  addAuthedRoutes() {
    this.app.post('/login', (req, res) => this.authMiddleware.handleLogin(req, res));
    this.app.post('/dao/refresh', (req, res) => this.authMiddleware.handleRefresh(req, res));
    this.app.post('/dao/putProposal', (req, res) => this.putProposal(req, res));
    this.app.get('/dao/file/:hash', (req, res) => this.getFile(req, res)); // for membersOnly data
  }

  addMiddleware() {
    this.app.use(compress())
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
    this.app.use(cors())
    this.app.use('/dao', (req, res, next) => this.authMiddleware.checkToken(req, res, next));
  }

  addStaticRoutes() {
    this.app.get('/', sendIndex)
    this.app.use(express.static('public'))
    this.app.use('/static', express.static(path.join(__dirname, 'public', 'static')))
  }

  setup() {
    this.addStaticRoutes()
    this.addMiddleware()
    this.addAuthedRoutes()
    this.app.post('/putApplication', (req, res) => this.putApplication(req, res))
    this.app.get('*', sendIndex)
  }

  async start() {
    this.setup()
    if (PORT == 443 && certPath && keyPath) {
      this.server = https.createServer({
        key: fs.readFileSync(keyPath, 'utf8'),
        cert: fs.readFileSync(certPath, 'utf8')
      }, this.app);
      this.server.listen(443, () => console.log(`Server is listening on port: ${PORT}`))
    }
    else this.app.listen(PORT, () => console.log(`Server is listening on port: ${PORT}`));
  }
}

