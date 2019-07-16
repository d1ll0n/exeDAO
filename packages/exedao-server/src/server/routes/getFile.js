const {fileNotFound} = require('../../lib/responses');

module.exports = async function getFile(req, res) {
  const {hash} = req.params;
  console.log(`got request /dao/file/${hash}`)
  this.readFile(hash)
    .then(data => res.json({data: JSON.parse(data)}))
    .catch(e => res.status(404).json(fileNotFound))
}