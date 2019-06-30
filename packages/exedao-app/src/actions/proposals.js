import {util} from 'exedao-js';
import { ADD_PROPOSALS, SET_PROPOSAL_DETAILS } from '../store/reducers/proposals';

export const getOpenProposals = () => {
  return async (dispatch, getState) => {
    const exedao = getState().exedao.exedao;
    let proposals = await exedao.getOpenProposals()
    dispatch({ type: ADD_PROPOSALS, proposals })
  }
}

export const submitVote = (method, ...args) => {
  return async (dispatch, getState) => {
    const exedao = getState().exedao.exedao;
    const proposalHash = exedao.hashProposal(method, ...args);
    await exedao.submitOrVote(proposalHash, 250000);
  }
}

export const executeProposal = (method, ...args) => {
  return (dispatch, getState) => {
    const exedao = getState().exedao.exedao
    return exedao.sendProposal(method, 250000, 0, ...args)
  }
}

export const submitProposal = async (exedao, proposalData, membersOnly) => {
  console.log(`submitting proposal`)
  const proposalHash = exedao.hashProposal(proposalData.function, ...proposalData.arguments)
  console.log(`proposal hash -- ${proposalHash}`)
  const hasMeta = proposalData.title != '' || proposalData.description != ''
  if (hasMeta) {
    const metaHash = exedao.hasher.jsonSha3(proposalData)
    console.log(`proposal meta hash -- ${metaHash}`)
    await exedao.submitWithMetaHash(proposalHash, metaHash, 250000)
    await exedao.api.putProposal({proposalHash, data: proposalData, membersOnly})
  }
  else return exedao.sendProposal(proposalData.function, 250000, 0, ...proposalData.arguments)
}

export const getProposalMetaData = (proposalHash, metaHash) => {
  return async (dispatch, getState) => {
    if (!proposalHash || !metaHash) return
    const {exedao, proposals} = getState().exedao;
    const proposal = proposals.filter(proposal => proposal.proposalHash == proposalHash)[0];
    console.log(`getting details for ${proposalHash} meta hash ${metaHash}`)
    const metadata = await exedao.getMetaData(metaHash)
    const approvalRequirement = exedao.approvalRequirements[metadata.function]
    const totalShares = exedao.totalShares;
    const votesNeeded = util.votesNeeded(approvalRequirement, totalShares, proposal.votes);
    const {functionName, functionSelector, parsedArgs} = exedao.getFuncCallDetails(metadata.function, metadata.arguments);
    console.log(parsedArgs)
    dispatch({type: SET_PROPOSAL_DETAILS, proposal: {proposalHash, votesNeeded, ...metadata, functionName, functionSelector, parsedArgs}});
  }
}