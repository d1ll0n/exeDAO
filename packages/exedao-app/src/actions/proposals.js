import { EXEDAO_ADD_PROPOSALS, EXEDAO_SET_PROPOSAL_DETAILS } from '../store/reducers/exedao';

export const getOpenProposals = () => {
  return async (dispatch, getState) => {
    const exedao = getState().exedao.exedao;
    let proposals = await exedao.getOpenProposals()
    dispatch({ type: EXEDAO_ADD_PROPOSALS, proposals })
  }
}

export const submitVote = (method, ...args) => {
  return async (dispatch, getState) => {
    const exedao = getState().exedao.exedao;
    const proposalHash = exedao.hashProposal(method, ...args);
    await exedao.submitOrVote(proposalHash, 250000);
  }
}

export const submitProposal = async (exedao, proposalData) => { // proposalData = {function, arguments, title, description}
  console.log(`submitting proposal`)
  const proposalHash = exedao.hashProposal(proposalData.function, ...proposalData.arguments)
  console.log(`proposal hash -- ${proposalHash}`)
  const hasMeta = proposalData.title || proposalData.description
  if (hasMeta) {
    const metaHash = exedao.hasher.jsonSha3(proposalData)
    console.log(`proposal meta hash -- ${metaHash}`)
    await exedao.submitWithMetaHash(proposalHash, metaHash, 250000)
    await exedao.api.putProposal({proposalHash, data: proposalData})
  }
  else return exedao.submitOrVote(proposalHash, 250000)
}

export const getProposalMetaData = (proposalHash, metaHash) => {
  return async (dispatch, getState) => {
    if (!proposalHash || !metaHash) return
    const {exedao} = getState().exedao;
    console.log(`getting details for ${proposalHash} meta hash ${metaHash}`)
    const metadata = await exedao.getMetaData(metaHash)
    dispatch({type: EXEDAO_SET_PROPOSAL_DETAILS, proposal: {proposalHash, ...metadata}})
  }
}