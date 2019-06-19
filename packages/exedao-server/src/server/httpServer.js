const bodyParser = require('body-parser');
const mh = require('multihashing-async');
const fs = require('fs');
const path = require('path');
const {putFileSuccess, fileNotFound} = require('../lib/responses');

const filesPath = path.join(__dirname, '..', 'data');
if (!fs.existsSync(filesPath)) fs.mkdirSync(filesPath);
const toPath = proposalHash => path.join(filesPath, proposalHash);



module.exports = class HttpServer {
  constructor(app, middleware) {
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.post('/login', middleware.handleLogin);
    app.use('/dao', middleware.checkToken);
    app.post('/dao/refresh', middleware.handleRefresh);
    // app.get('/authed/proposalMeta/:proposalMetaHash');
    app.post('/dao/putProposal', this.putProposal);
    app.get('/dao/file/:hash', this.getFile); // for private data
  }

  async start({exedao, temporal, db}) {
    const port = process.env.PORT || 8000;
    app.listen(port, () => console.log(`Server is listening on port: ${port}`));
    this.exedao = exedao;
    this.temporal = temporal;
    this.db = db;
  }

  async saveFile(filePath, file, private) {
    if (fs.existsSync(filePath)) throw new Error('File already uploaded.')
    fs.writeFileSync(filePath, file);
    if (!private) {
      const rs = fs.createReadStream(filePath);
      await temporal.uploadPublicFile(rs, 1);
    }
    return true;
  }

  getFile(req, res) {
    const {hash} = req.params;
    const filePath = toPath(hash);
    if (!fs.existsSync(filePath)) return res.status(404).json(fileNotFound);
    const file = fs.readFileSync(filePath);
    return res.json({ data: file })
  }

  putProposal(req, res) {
    const {proposalHash, data, private, extension} = req.body;
    this.exedao.verifyProposalMeta(proposalHash, data, extension).then(async () => {
      const file = JSON.stringify(data);
      const fileHash = await mh(file, 'sha3-256');
      const filePath = toPath(fileHash);
      if (extension && data.function == 'addExtension') {
        const extFile = JSON.stringify(extension);
        const extHash = await mh(extFile, 'sha3-256');
        const extPath = toPath(extHash);
        await this.saveFile(extPath, extFile, private);
      }
      await this.saveFile(filePath, file, private);
      return res.json(putFileSuccess(fileHash));
    }).catch((err) => {
      console.error(err)
      return res.status(400).json({ message: err.message });
    });
  }
}

