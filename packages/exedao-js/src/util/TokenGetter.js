const { toAscii } = require('web3-utils');
const uniswapFactory = require('../../build/uniswapFactory');
const uniswapExchange = require('../../build/uniswapExchange');

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
    // const decimals = await exchange.methods.decimals().call();
    let price = await exchange.methods.getEthToTokenInputPrice('1000000000000000000').call();
    const logo = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens/' + tokenAddress.toLowerCase() + '.png';
    price = (price / 1000000000000000000).toFixed(4);
    console.log({ logo, name, symbol, price })
    return { logo, name, symbol, price }
  }
}