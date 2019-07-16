const {putFileSuccess} = require('../../lib/responses');

module.exports = function putProposal(req, res) {
  const {proposalHash, data, membersOnly, extension} = req.body;
  console.log(`got request /dao/putProposal`)
  this.exedao.verifyProposalMeta(proposalHash, data, extension).then(async () => {
    const fileHash = await this.saveFile(data, membersOnly)
    if (extension && data.function == 'addExtension') await this.saveFile(extension, membersOnly);
    return res.json({data: putFileSuccess(fileHash)});
  }).catch((err) => {
    console.error(err)
    return res.status(400).json({ message: err.message });
  });
}