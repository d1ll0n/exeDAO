const bodyParser = require('body-parser');
const cors = require('cors')
const mh = require('multihashing-async');
const fs = require('fs');
const path = require('path');
const {putFileSuccess, fileNotFound} = require('../lib/responses');

const filesPath = path.join(__dirname, '..', 'data');
if (!fs.existsSync(filesPath)) fs.mkdirSync(filesPath);
const toPath = proposalHash => path.join(filesPath, proposalHash);



module.exports = class HttpServer {
  constructor(app, middleware) {
    this.app = app;
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cors())
    app.post('/login', (req, res) => middleware.handleLogin(req, res));
    app.use('/dao', (req, res, next) => middleware.checkToken(req, res, next));
    app.post('/dao/refresh', (req, res) => middleware.handleRefresh(req, res));
    // app.get('/authed/proposalMeta/:proposalMetaHash');
    app.post('/dao/putProposal', (req, res) => this.putProposal(req, res));
    app.get('/dao/file/:hash', (req, res) => this.getFile(req, res)); // for membersOnly data
  }

  async start({exedao, temporal, db}) {
    const port = process.env.PORT || 8000;
    this.app.listen(port, () => console.log(`Server is listening on port: ${port}`));
    this.exedao = exedao;
    this.temporal = temporal;
    this.db = db;
  }

  async saveFile(filePath, file, membersOnly) {
    if (fs.existsSync(filePath)) throw new Error('File already uploaded.')
    fs.writeFileSync(filePath, file);
    if (!membersOnly) {
      const rs = fs.createReadStream(filePath);
      await temporal.uploadPublicFile(rs, 1);
    }
    return true;
  }

  getFile(req, res) {
    const {hash} = req.params;
    console.log(`got request /dao/file/${hash}`)
    const filePath = toPath(hash);
    if (!fs.existsSync(filePath)) return res.status(404).json(fileNotFound);
    const file = fs.readFileSync(filePath);
    return res.json({ data: file })
  }

  putProposal(req, res) {
    const {proposalHash, data, membersOnly, extension} = req.body;
    console.log(`got request /dao/putProposal`)
    this.exedao.verifyProposalMeta(proposalHash, data, extension).then(async () => {
      const file = JSON.stringify(data);
      const fileHash = await mh(file, 'sha3-256');
      const filePath = toPath(fileHash);
      if (extension && data.function == 'addExtension') {
        const extFile = JSON.stringify(extension);
        const extHash = await mh(extFile, 'sha3-256');
        const extPath = toPath(extHash);
        await this.saveFile(extPath, extFile, membersOnly);
      }
      await this.saveFile(filePath, file, membersOnly);
      return res.json(putFileSuccess(fileHash));
    }).catch((err) => {
      console.error(err)
      return res.status(400).json({ message: err.message });
    });
  }
}

