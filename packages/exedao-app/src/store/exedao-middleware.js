import { ExeDAO } from 'exedao-js';
import Web3 from 'web3';
import { WEB3_SET } from './reducers/web3';
import {
  EXEDAO_ADD_PROPOSAL,
  EXEDAO_SET_PROPOSAL_DETAILS,
  EXEDAO_ADD_TOKENS,
  EXEDAO_ADD_VOTES,
  EXEDAO_SET,
  EXEDAO_ADD_BUY_REQUEST
} from './reducers/exedao';
import { dispatch } from 'rxjs/internal/observable/pairs';

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
  const exeDAOAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  console.log(exeDAOAddress)

  async function setExedao(exedao, dispatch) {
    console.log('Adding proposal listener')
    await exedao.init()
    dispatch({type: EXEDAO_SET, exedao})
    
    exedao.addListener(
      'ProposalSubmission',
      async ({proposalHash}) =>
        dispatch({type: EXEDAO_ADD_PROPOSAL, proposal: await exedao.getProposal(proposalHash)}))

    exedao.addListener(
      'ProposalVote',
      ({proposalHash, votesCast}) =>
        dispatch({type: EXEDAO_ADD_VOTES, proposal: {proposalHash, votesCast}}))
    
    exedao.addListener(
      'BuyRequestAdded',
      ({applicant}) => {
        const buyRequest = exedao.getBuyRequest(applicant);
        dispatch({type: EXEDAO_ADD_BUY_REQUEST, buyRequest})
      }
    )
  }

  async function apiLogin(exedao) {
    if (exedao.ownedShares && !exedao.api.token) await exedao.api.login()
  }

  return ({ dispatch }) => {
    return next => (action) => {
      const {web3, accounts, loggedIn, type} = action;
      if (type == WEB3_SET) {
        const exedao = new ExeDAO(web3, accounts[0], exeDAOAddress);
        setExedao(exedao, dispatch)
          .then(() => loggedIn && apiLogin(exedao))
      }
      return next(action);
    };
  };
}