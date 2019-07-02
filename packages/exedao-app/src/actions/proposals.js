import {util} from 'exedao-js';
import { ADD_PROPOSALS, SET_PROPOSAL_DETAILS } from '../store/reducers/proposals';

/* 
async function fullProposalDetails(exedao, proposal) {
  console.log(proposal)
  const metadata = await exedao.getMetaData(proposal.metaHash)
  const approvalRequirement = exedao.approvalRequirements[metadata.function]
  const totalShares = exedao.totalShares;
  const calculatedProposalHash = exedao.hashProposal(metadata.function, ...metadata.arguments);
  if (calculatedProposalHash != proposal.proposalHash) {
    console.log(`Metadata did not match proposal`)
    console.log(`Proposal hash expected ${proposal.metaHash}`)
    console.log(`Proposal hash calculated ${calculatedProposalHash}`)
    console.log(metadata)
  } else {
    const votesNeeded = util.votesNeeded(approvalRequirement, totalShares, proposal.votes);
    const {functionName, functionSelector, parsedArgs} = exedao.getFuncCallDetails(metadata.function, metadata.arguments);
    return {...metadata, functionName, votesNeeded, functionSelector, parsedArgs, ...proposal}
  }
}

export const getOpenProposals = () => {
  return async (dispatch, getState) => {
    const exedao = getState().exedao.exedao;
    let proposals = await exedao.getOpenProposals()
    let proposalProms = proposals.map(proposal => fullProposalDetails(exedao, proposal));
    proposals = await Promise.all(proposalProms)
    console.log(proposals)
    dispatch({ type: ADD_PROPOSALS, proposals })
  }
} */

export const getOpenProposals = () => {
  return async (dispatch, getState) => {
    const exedao = getState().exedao.exedao;
    let proposals = await exedao.getOpenProposals()
    for (let prop of proposals) {
      console.log(`CID: ${exedao.api.toCid(prop.metaHash)}`)
    }
    console.log(proposals)
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

export const submitProposal = async (exedao, proposalData, membersOnly = false, gas = 250000) => {
  console.log(`submitting proposal`)
  const proposalHash = exedao.hashProposal(proposalData.function, ...proposalData.arguments)
  console.log(`proposal hash -- ${proposalHash}`)
  const hasMeta = proposalData.title != '' || proposalData.description != ''
  if (hasMeta) {
    const metaHash = exedao.hasher.jsonSha3(proposalData)
    console.log(`proposal meta hash -- ${metaHash}`)
    await exedao.submitWithMetaHash(proposalHash, metaHash, gas)
    await exedao.api.putProposal({proposalHash, data: proposalData, membersOnly})
  }
  else return exedao.sendProposal(proposalData.function, gas, 0, ...proposalData.arguments)
}

export const getProposalMetaData = (proposalHash, metaHash) => {
  return async (dispatch, getState) => {
    if (!proposalHash || !metaHash) return
    const {exedao: {exedao}, proposals: {proposals}} = getState();
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