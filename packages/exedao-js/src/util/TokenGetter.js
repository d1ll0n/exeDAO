const { toAscii, toBN, } = require('web3-utils');
const Rational = require('tough-rational');
const uniswapFactory = require('../../build/uniswapFactory');
const uniswapExchange = require('../../build/uniswapExchange');

Rational.useFallback(true);

const {stripDecimals} = require('./index')

module.exports = class TokenGetter {
  constructor(web3) {
    this.web3 = web3;
    this.factory = new this.web3.eth.Contract(uniswapFactory, '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95');
  }

  async getTokenInfo(tokenAddress) {
    const exchangeAddress = await this.factory.methods.getExchange(tokenAddress).call();
    if (exchangeAddress == '0x0000000000000000000000000000000000000000') return null;
    const exchange = new this.web3.eth.Contract(uniswapExchange, exchangeAddress);
    const token = new this.web3.eth.Contract(uniswapExchange, tokenAddress);
    const name = toAscii(await token.methods.name().call().catch(e => '')).replace(/x00/g, '');
    const symbol = toAscii(await token.methods.symbol().call().catch(e => '')).replace(/x00/g, '');
    const decimals = Rational(await token.methods.decimals().call().catch(e => 0))
    console.log(decimals)
    let price = await exchange.methods.getEthToTokenInputPrice('1000000000000000000').call();
    const logo = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens/' + tokenAddress.toLowerCase() + '.png';
    // price = stripDecimals((price / 1000000000000000000), decimals || 1e18);
    console.log(price)
    price = +stripDecimals(Rational(1).div(Rational((price).substr(0, 66)).div('1000000000000000000')).toDecimal(), decimals || 1e18);
    price = price.toFixed(4)
    console.log(price)
    console.log('price', price)
    console.log({ logo, name, symbol, price })
    return { logo, name, symbol, price, decimals }
  }
}