import { EXEDAO_ADD_PROPOSALS, EXEDAO_SET_PROPOSAL_DETAILS } from '../store/reducers/exedao';

export const getOpenProposals = () => {
  return async (dispatch, getState) => {
    const exedao = getState().exedao.exedao;
    const proposals = await exedao.getOpenProposals()
    dispatch({ type: EXEDAO_ADD_PROPOSALS, proposals })
  }
}

const testProposal = {
  function: 'mintShares',
  arguments: ['0xa20D58D7dB00327e9d4597fEf9f50E955fd14A3F', 1200],
  title: 'Test Proposal',
  description: 'Do a test and send 1200 shares to a test address.'
}

export const sendTestProposal = () => {
  return async (dispatch, getState) => {
    const exedao = getState().exedao.exedao;
    // data = {proposalHash, data, membersOnly, extension}
    const proposalHash = exedao.hashProposal(testProposal.function, ...testProposal.arguments)
    const data = { proposalHash, data: testProposal }
    // exedao.api.putProposal
    exedao.submitWithMetaHash()
  }
}

/* export const sendProposal = (proposalData) => {

} */