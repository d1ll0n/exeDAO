import Web3 from 'web3';
import { WEB3_REQUEST, WEB3_SET, WEB3_CANCEL } from '../store/reducers/web3';

const defaultWeb3Url = process.env.REACT_APP_WEB3_DEFAULT;

export const requestWeb3 = () => dispatch => dispatch({type: WEB3_REQUEST})

export const initWeb3 = () => {
    return async (dispatch) => {
        const web3 = new Web3(window.web3 && window.web3.currentProvider || defaultWeb3Url);
        const accounts = await web3.eth.getAccounts()
        dispatch({type: WEB3_SET, web3, accounts})
    }
}

export const cancelRequest = () => dispatch => dispatch({type: WEB3_CANCEL})

// export const showSnack = () => dispatch => dispatch({type: SHOW_LOGIN_SNACK})
// export const hideSnack = () => dispatch => dispatch({type: HIDE_LOGIN_SNACK})