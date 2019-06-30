import {updateItem} from './util';

export const ADD_PROPOSAL = 'PROPOSALS/ADD_PROPOSAL';
export const ADD_PROPOSALS = 'PROPOSALS/ADD_PROPOSALS';
export const SET_PROPOSAL_DETAILS = 'PROPOSALS/SET_PROPOSAL_DETAILS';
export const ADD_VOTES = 'PROPOSALS/ADD_VOTES';

const initialState = {
  proposals: [],
}

export default (state = initialState, action) => {
  const {type, proposals, proposal} = action
  switch (type) {
    case ADD_PROPOSAL:
      if (state.proposals.some(prop => prop.proposalHash == proposal.proposalHash)) return state
      return {proposals: [...state.proposals, proposal]}

    case ADD_PROPOSALS:
      return {proposals: [...state.proposals, ...proposals]}

    case SET_PROPOSAL_DETAILS:
      return {proposals: updateItem(state.proposals, proposal, 'proposalHash')}

    case ADD_VOTES:
      return {
        proposals: updateItem(
          state.proposals, proposal, 'proposalHash',
          (_proposal, {votes}) => ({ ..._proposal, votes: _proposal.votes + votes})
        )
      }
        
    default:
      return state
  }
}