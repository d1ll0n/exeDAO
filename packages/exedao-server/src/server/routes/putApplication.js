const {putFileSuccess} = require('../../lib/responses');

module.exports = function putApplication(req, res) {
  const {applicant, application} = req.body;
  console.log(`got request /putApplication`)
  this.exedao.verifyApplication(applicant, application).then(async () => {
    const fileHash = await this.saveFile(application, false);
    return res.json(putFileSuccess(fileHash));
  }).catch((err) => {
    console.error(err)
    return res.status(400).json({ message: err.message });
  });
}