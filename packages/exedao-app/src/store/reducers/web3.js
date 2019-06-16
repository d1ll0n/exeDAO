import Web3 from 'web3';

export const WEB3_REQUEST = `web3/REQUEST`
export const WEB3_SET = `web3/SET`
export const WEB3_CANCEL = 'web3/CANCEL'

const initialState = {
    accounts: [],
    usingInfura: true,
    web3: new Web3('https://mainnet.infura.io/v3'),
    pending: false,
    // hasMetaMask: window.ethereum && true // just set bool, no web3 object
}

export default (state = initialState, action) => {
    const {accounts, type, web3} = action;
    switch (type) {
        case WEB3_REQUEST:
            return {...state, pending: true}
        case WEB3_SET:
            console.log('set web3')
            return {...state, web3, accounts, pending: false, usingInfura: false}
        case WEB3_CANCEL:
            return {...state, pending: false}
        default:
            return state
    }
}