const sigUtil = require('eth-sig-util');
const {soliditySha3} = require('web3-utils');
const randomBytes = require('../lib/random');
const jwt = require('../lib/jwt');

const { tokenNotSupplied, badToken, loginSuccess, badLoginRequest, challengeResponse, notDaoMember } = require('../lib/responses');

const challengeHash = challengeToken => soliditySha3(challengeToken.toString('hex'));

const getChallengeParams = (challengeToken, address) => [
  { type: 'string', name: 'Message', value: `I certify that I am the owner of ${address}` },
  { type: 'bytes32', name: 'Verification ID', value: challengeHash(challengeToken) }
]

class AuthMiddleware {
  constructor(secret, exedao) {
    this.jwt = jwt(secret);
    this.exedao = exedao;
  }

  createChallenge(address) {
    return this.jwt.sign({address, approved: false, salt: randomBytes()});
  }

  verifyChallenge(challengeToken, signature) {
    const {address} = this.jwt.verify(challengeToken);
    const challenge = getChallengeParams(challengeToken, address);
    const recovered = sigUtil.recoverTypedSignature({ data: challenge, sig: signature });
    if (recovered !== address.toLowerCase()) throw new Error('Invalid signature');
    return this.createToken(address);
  }

  createToken(address) {
    return this.jwt.sign({address, approved: true});
  }

  verifyToken(token) {
    const {address, approved} = this.jwt.verify(token);
    if (!approved) throw new Error('Invalid token -- challenge token received');
    return address;
  }

  refresh(token) {
    const address = this.verifyToken(token);
    return this.createToken(address);
  }

  /* http functions */
  handleRefresh(req, res) {
    const address = req.ethAddress;
    const token = this.createToken(address);
    return res.json(loginSuccess(token));
  }

  checkToken(req, res, next) {
    let token = req.token || req.headers['x-access-token'] || req.headers['authorization'];
    if (token.startsWith('Bearer ')) token = token.slice(7, token.length);
    if (!token) return res.status(401).json(tokenNotSupplied);
    try {
      const address = this.verifyToken(token);
      req.ethAddress = address;
      next();
    } catch(e) {
      return res.status(401).json(badToken)
    }
  }

  async handleLogin(req, res) {
    const {challengeToken, signature, address} = req.body;
    try {
      if (address) {
        console.log(`got login request: ${address}`)
        const shares = await this.exedao.getShares(address);
        if (shares < 1) return res.status(500).json(notDaoMember);
        const challenge = this.createChallenge(address);
        return res.json(challengeResponse(challenge));
      }
      if (challengeToken && signature) {
        console.log(`got login response: ${challengeToken} ${signature}`)
        const token = this.verifyChallenge(challengeToken, signature);
        req.token = token;
        return res.json(loginSuccess(token));
      }
      return res.status(400).json(badLoginRequest);
    } catch (err) {
      console.log(err)
      return res.status(400).json(badLoginRequest);
    }
  }

  /* websocket functions */
  wsCheckToken(socket) {
    return socket.token;
  }

  wsHandleLogin(socket) {
    socket.on('/login', ({challengeToken, signature, address}, cb) => {
      if (address) {
        const challenge = this.createChallenge(address);
        return cb(challengeResponse(challenge));
      }
      if (challengeToken && signature) {
        try {
          const token = this.verifyChallenge(challengeToken, signature);
          req.token = token;
          return cb(loginSuccess(token));
        } catch (err) {
          return cb(badLoginRequest());
        }
      }
      return cb(badLoginRequest());
    })
  }
}

module.exports = AuthMiddleware;