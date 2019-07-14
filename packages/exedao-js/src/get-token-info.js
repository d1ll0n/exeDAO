'use strict';

const rpcCall = require('kool-makerpccall');
const PromiseQueue = require('promiseq');
const abi = require('web3-eth-abi').AbiCoder();
const addHexPrefix = (s) => s.substr(0, 2) === '0x' ? s : '0x' + s;
const {
  toBN,
  toAscii,
  soliditySha3
} = require('web3-utils');
const Rational = require('tough-rational');
const { XMLHttpRequest } = require('xmlhttprequest');
const { toBuffer } = require('ethereumjs-util');
Rational.useFallback(true);

const UNISWAP_FACTORY_ADDRESS = '0xc0a47dfe034b400b47bdad5fecda2621de6c4d95';

const NAME_SIGNATURE = soliditySha3('name()').substr(2, 8);
const SYMBOL_SIGNATURE = soliditySha3('symbol()').substr(2, 8);
const ZERO_BYTE_RE = /\x00/g;

const MAX_JOBS = 20; // who cares

const lastN = (s, n) => String(s).substr(s.length - n, n);

const stripDecimals = (s, e) => {
  s = String(s);
  const i = s.lastIndexOf('.');
  if (~i) {
    const decimals = s.length - i - 1;
    if (decimals <= e) return s;
    return s.substr(0, i + e + 1).replace(/\.$/, '');
  }
  return s;
};

const addressFromBytes32 = (s) => addHexPrefix(lastN(s, 40));

const GET_EXCHANGE_ABI = {
  name: 'getExchange',
  inputs: [{
    name: 'token',
    type: 'address'
  }]
};

const GET_ETH_TO_TOKEN_INPUT_PRICE_ABI = {
  name: 'getEthToTokenInputPrice',
  inputs: [{
    name: 'eth_sold',
    type: 'uint256'
  }]
};

const getSymbol = async (rpc, tokenAddress) => toAscii(await rpcCall(rpc, 'eth_call', [{
  to: tokenAddress,
  data: addHexPrefix(SYMBOL_SIGNATURE)
}, 'latest'])).replace(ZERO_BYTE_RE, '');

const getName = async (rpc, tokenAddress) => toAscii(await rpcCall(rpc, 'eth_call', [{
  to: tokenAddress,
  data: addHexPrefix(NAME_SIGNATURE)
}, 'latest'])).replace(ZERO_BYTE_RE, '')

const getExchangeAddress = async (rpc, tokenAddress) => addressFromBytes32((await rpcCall(rpc, 'eth_call', [{
  to: UNISWAP_FACTORY_ADDRESS,
  data: abi.encodeFunctionCall(GET_EXCHANGE_ABI, [ tokenAddress ])
}, 'latest'])));

const getCode = async (rpc, address) => rpcCall(rpc, 'eth_getCode', [ address, 'latest' ]);

const callGetterOrReturnFallback = async (rpc, address, getter, signature, replaceIfInvalid) => {
  const supportsFunction = Boolean((await getCode(rpc, address)).match(signature));
  if (!supportsFunction) return replaceIfInvalid;
  return getter(rpc, address);
};

const getEthPriceOfToken = async (rpc, tokenAddress, decimals) => stripDecimals(Rational(1).div(Rational((await rpcCall(rpc, 'eth_call', [{
  to: await getExchangeAddress(rpc, tokenAddress),
  data: abi.encodeFunctionCall(GET_ETH_TO_TOKEN_INPUT_PRICE_ABI, [ '1000000000000000000' ])
}, 'latest'])).substr(0, 66)).div('1000000000000000000')).toDecimal(), decimals);

const getImageData = async (tokenAddress) => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens/' + tokenAddress.toLowerCase() + '.png');
  xhr.addEventListener('readystatechange', () => {
    if (xhr.readyState === 4) resolve('https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens/' + tokenAddress.toLowerCase() + '.png');
    // if (xhr.readyState === 4) resolve(xhr.responseText);
  });
  xhr.addEventListener('error', (e) => reject(e));
  xhr.send();
}).then((resp) => resp.match('404') ? null : resp);

const getTokenInfo = async (rpc, address) => ({
  address,
  name: await callGetterOrReturnFallback(rpc, address, getName, NAME_SIGNATURE, 'noname-' + address),
  symbol: await callGetterOrReturnFallback(rpc, address, getSymbol, SYMBOL_SIGNATURE, '000'),
  price: (await getEthPriceOfToken(rpc, address, 18)),
  logo: await getImageData(address)
});

const getTokensInfo = async (rpc, tokenAddresses) => {
  // const pq = new PromiseQueue(MAX_JOBS);
  return Promise.all(tokenAddresses.map((address) => getTokenInfo(rpc, address).catch((e) => ({ error: e }))));
};

module.exports = {getTokenInfo, getTokensInfo};
