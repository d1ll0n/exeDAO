import Web3 from 'web3';

export const WEB3_REQUEST = `web3/REQUEST`
export const WEB3_SET = `web3/SET`
export const WEB3_CANCEL = 'web3/CANCEL'

const defaultWeb3Url = process.env.REACT_APP_WEB3_DEFAULT;

const web3Provider = (defaultWeb3Url.indexOf('wss') >= 0) ? new Web3.providers.WebsocketProvider(defaultWeb3Url) : defaultWeb3Url

const initialState = {
    accounts: [],
    loggedIn: window.web3 && window.web3.eth.accountsfalse,
    web3: window.web3 || new Web3(web3Provider),
    pending: false,
}

export default (state = initialState, action) => {
    const {accounts, type, web3} = action;
    switch (type) {
        case WEB3_REQUEST:
            return {...state, pending: true}
        case WEB3_SET:
            return {...state, web3, accounts, pending: false, loggedIn: accounts.length > 0}
        case WEB3_CANCEL:
            return {...state, pending: false}
        default:
            return state
    }
}