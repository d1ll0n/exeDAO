const failure = (reason, extra = {}) => ({ success: false, reason, ...extra });
const success = (data) => ({ success: true, data });

/* LOGIN RESPONSES */
const tokenNotSupplied = failure('Auth token not supplied.');
const badToken = failure('Invalid token received.');
const badLoginRequest = failure('Invalid login request.');
const notDaoMember = failure('Not a member of exeDAO');

const challengeResponse = (challenge) => success({challenge})
const loginSuccess = (token) => success({token});


/* UPLOAD RESPONSES */
const hashDoesNotMatch = extra => failure('Input hash does not match data on exeDAO contract.', extra)
const alreadySaved = failure('File already pinned');
const fileNotFound = failure('Could not find file')

const putFileSuccess = dataHash => success({hash: dataHash});

module.exports = {
  failure,
  tokenNotSupplied,
  notDaoMember,
  challengeResponse,
  badToken,
  badLoginRequest,
  success,
  loginSuccess,
  hashDoesNotMatch,
  alreadySaved,
  putFileSuccess
}
