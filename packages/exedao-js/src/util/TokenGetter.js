const { toAscii, toBN, toHex} = require('web3-utils');
const Rational = require('tough-rational');
const uniswapFactory = require('../../build/uniswapFactory');
const uniswapExchange = require('../../build/uniswapExchange');
const rp = require('request-promise')

Rational.useFallback(true);

const {stripDecimals} = require('./index')

const abiUrl = `http://api.etherscan.io/api?module=contract&action=getabi&address=`

module.exports = class TokenGetter {
  constructor(web3) {
    this.web3 = web3;
    this.factory = new this.web3.eth.Contract(uniswapFactory, '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95');
  }

  async getFromContract(tokenAddress) {
    const abi = await rp.get(`${abiUrl}${tokenAddress}`).then(JSON.parse).then(data => JSON.parse(data.result)).catch(e => null);
    if (!abi) return null
    const token = new this.web3.eth.Contract(abi, tokenAddress);
    let name, symbol, decimals
    const nameAbi = abi.filter(f => f.name == 'name')[0];
    if (nameAbi) {
      const val = await token.methods.name().call();
      name = (nameAbi.outputs[0].type == 'string') ? val : toAscii(toHex(val))
    }
    const symbolAbi = abi.filter(f => f.name == 'name')[0];
    if (symbolAbi) {
      const val = await token.methods.symbol().call();
      symbol = (symbolAbi.outputs[0].type == 'string') ? val : toAscii(toHex(val))
    }
    const decimalAbi = abi.filter(f => f.name == 'name')[0];
    if (decimalAbi) {
      const val = await token.methods.decimals().call();
      decimals = (decimalAbi.outputs[0].type == 'string') ? val : toBN(val)
    }
    return {name, symbol, decimals}
  }

  async getTokenInfo(tokenAddress) {
    const exchangeAddress = await this.factory.methods.getExchange(tokenAddress).call();
    if (exchangeAddress == '0x0000000000000000000000000000000000000000') return null;
    const exchange = new this.web3.eth.Contract(uniswapExchange, exchangeAddress);
    const {name, symbol, decimals} = await this.getFromContract(tokenAddress)
    let price = await exchange.methods.getEthToTokenInputPrice('1000000000000000000').call();
    const logo = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens/' + tokenAddress.toLowerCase() + '.png';
    // price = stripDecimals((price / 1000000000000000000), decimals || 1e18);
    price = +stripDecimals(Rational(1).div(Rational((price).substr(0, 66)).div('1000000000000000000')).toDecimal(), decimals || 1e18);
    console.log({ logo, name, symbol, price })
    return { logo, name, symbol, price, decimals }
  }
}