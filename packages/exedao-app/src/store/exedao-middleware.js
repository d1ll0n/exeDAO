import { exeDAO } from 'exedao-js';
import Web3 from 'web3';
import { WEB3_SET } from './reducers/web3';
import { EXEDAO_ADD_PROPOSAL, EXEDAO_SET_PROPOSAL_DETAILS, EXEDAO_ADD_VOTES, EXEDAO_SET } from './reducers/exedao';

/* 
function execute(action, next, dispatch) {
  const {type, web3, accounts} = action;
  switch (type) {
    case WEB3_SET:
      exedao = new exeDAO(web3, accounts[0], exeDAOAddress)
  }
}
*/

export default function createExedaoMiddleware() {
  const exeDAOAddress = '0xFCeEa18fF2C6c5f8c66f744CcD2C352ccFCd9bDC';

  async function setExedao(exedao, dispatch) {
    console.log('Adding proposal listener')
    await exedao.init()
    dispatch({type: EXEDAO_SET, exedao})
    
    exedao.addProposalListener(
      async ({proposalHash}) =>
        dispatch({type: EXEDAO_ADD_PROPOSAL, proposal: await exedao.getProposal(proposalHash)}))

    exedao.addVoteListener(
      ({proposalHash, votesCast}) =>
        dispatch({type: EXEDAO_ADD_VOTES, proposal: {proposalHash, votesCast}}))
  }

  async function apiLogin(exedao) {
    if (exedao.ownedShares && !exedao.api.token) await exedao.api.login()
  }

  return ({ dispatch }) => {
    return next => (action) => {
      const {web3, accounts, loggedIn, type} = action;
      if (type == WEB3_SET) {
        const exedao = new exeDAO(web3, accounts[0], exeDAOAddress);
        setExedao(exedao, dispatch).then(() => loggedIn && apiLogin(exedao));
      }
      return next(action);
    };
  };
}