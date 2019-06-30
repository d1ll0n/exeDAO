const fs = require('fs');
const path = require('path')
const easySolc = require('../../easy-solc');

const erc20 = fs.readFileSync(path.join(__dirname, 'ERC20.sol'), 'utf8')
const ierc20 = fs.readFileSync(path.join(__dirname, 'IERC20.sol'), 'utf8')
const safemath = fs.readFileSync(path.join(__dirname, 'SafeMath.sol'), 'utf8')

const sources = {
  'IERC20.sol': {content: ierc20},
  'SafeMath.sol': {content: safemath}
}

module.exports = easySolc.compile('ERC20', erc20, false, sources);