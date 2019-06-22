import Web3 from 'web3';
import { WEB3_REQUEST, WEB3_SET, WEB3_CANCEL } from '../store/reducers/web3';

export const requestWeb3 = () => dispatch => dispatch({type: WEB3_REQUEST})

export const setWeb3 = () => {
    return async (dispatch) => {
        
        const web3 = new Web3(window.web3.currentProvider || 'https://mainnet.infura.io/v3')
        const accounts = await web3.eth.getAccounts()
        console.log('accounts ', accounts.length)
        dispatch({type: WEB3_SET, web3, accounts, loggedIn: true})
    }
}

export const initWeb3 = () => {
    return async (dispatch) => {
        const web3 = new Web3('http://localhost:8545');
        dispatch({type: WEB3_SET, web3, accounts: [], loggedIn: false})
    }
}

export const cancelRequest = () => dispatch => dispatch({type: WEB3_CANCEL})