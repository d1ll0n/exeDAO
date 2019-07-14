import { ExeDAO } from 'exedao-js';
import Web3 from 'web3';
import { WEB3_SET } from './reducers/web3';
import {
  EXEDAO_ADD_TOKEN,
  EXEDAO_ADD_TOKENS,
  EXEDAO_SET,
} from './reducers/exedao';
import {
  ADD_APPLICATION,
  ADD_APPLICATIONS,
  REMOVE_APPLICATION
} from './reducers/applications';
import {
  ADD_PROPOSAL,
  REMOVE_PROPOSAL,
  ADD_PROPOSALS,
  SET_PROPOSAL_DETAILS,
  ADD_VOTES,
} from './reducers/proposals';

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
    await exedao.init();
    dispatch({type: EXEDAO_SET, exedao});
   /*  const applications = await exedao.getOpenApplications();
    dispatch({type: ADD_APPLICATIONS, applications})
    const proposals = await exedao.getOpenProposals();
    dispatch({type: EXEDAO_SET, exedao}); */
    
    exedao.addListener(
      'ProposalSubmission',
      async ({proposalHash}) =>
        dispatch({type: ADD_PROPOSAL, proposal: await exedao.getProposal(proposalHash)}))
    
    exedao.addListener(
      'ProposalApproval',
      async ({proposalHash}) =>
        dispatch({type: REMOVE_PROPOSAL, proposal: {proposalHash}}))
    
    exedao.addListener(
      'ProposalExpiration',
      async ({proposalHash}) =>
        dispatch({type: REMOVE_PROPOSAL, proposal: {proposalHash}}))

    exedao.addListener(
      'ProposalVote',
      ({proposalHash, votesCast}) =>
        dispatch({type: ADD_VOTES, proposal: {proposalHash, votesCast}}))
    
    exedao.addListener(
      'ApplicationAdded',
      async ({applicant}) =>
        dispatch({type: ADD_APPLICATION, application: await exedao.getApplication(applicant)}))
    
    exedao.addListener(
      'ApplicationCanceled',
      async ({applicant}) =>
        dispatch({type: REMOVE_APPLICATION, application: {applicant}}))

    exedao.addListener(
      'TokenAdded',
      ({tokenAddress}) =>
        dispatch({type: EXEDAO_ADD_TOKEN, token: {tokenAddress}}))
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