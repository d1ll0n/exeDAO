import { exeDAO } from 'exedao.js';
import Web3 from 'web3';

import { WEB3_SET } from './web3';

const initialState = {
  exedao: new exeDAO(new Web3('http://127.0.0.1:8545'), null, '0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab'),
}

export default (state = initialState, action) => {
    const {web3, accounts, type} = action
    switch (type) {
        case WEB3_SET:
            return {exedao: new exeDAO(web3, accounts[0], '0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab')}
        default:
            return state
    }
}