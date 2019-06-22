export const EXEDAO_SET = 'EXEDAO/SET'
export const EXEDAO_ADD_PROPOSAL = 'EXEDAO/ADD_PROPOSAL';
export const EXEDAO_ADD_PROPOSALS = 'EXEDAO/ADD_PROPOSALS';
export const EXEDAO_SET_PROPOSAL_DETAILS = 'EXEDAO/SET_PROPOSAL_DETAILS';

export const EXEDAO_ADD_VOTES = 'EXEDAO/ADD_VOTES';

const initialState = {
  exedao: null,
  proposals: [],
  proposalsMeta: [],
  voteRequested: null
}

export default (state = initialState, action) => {
    const {type, proposals, proposal, exedao} = action
    let _proposals
    switch (type) {
        case EXEDAO_SET:
            console.log('set exedao')
            return { ...state, exedao, loading: false }

        case EXEDAO_ADD_PROPOSAL:
            return {
                ...state,
                proposals: [...state.proposals, proposal]
            }

        case EXEDAO_ADD_PROPOSALS:
            return {
                ...state,
                proposals: [...state.proposals, ...proposals]
            }

        case EXEDAO_SET_PROPOSAL_DETAILS:
            // get current proposals in state that do not match the new proposal
            _proposals = state.proposals.map((_proposal) => {
                if (_proposal.proposalHash == proposal.proposalHash) return {..._proposal, ...proposal}
                return _proposal
            })
            return {
                ...state,
                proposals: _proposals
            }

        case EXEDAO_ADD_VOTES:
            const {proposalHash, votes} = proposal;
            _proposals = state.proposals.map((_proposal) => {
                if (proposalHash == _proposal.proposalHash) return {..._proposal, votes: _proposal.votes + votes}
                return _proposal
            });
            return {
                ...state,
                proposals: _proposals
            }
            
        default:
            return state
    }
}