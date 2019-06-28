export const EXEDAO_SET = 'EXEDAO/SET'
export const EXEDAO_ADD_PROPOSAL = 'EXEDAO/ADD_PROPOSAL';
export const EXEDAO_ADD_PROPOSALS = 'EXEDAO/ADD_PROPOSALS';
export const EXEDAO_SET_PROPOSAL_DETAILS = 'EXEDAO/SET_PROPOSAL_DETAILS';
export const EXEDAO_ADD_VOTES = 'EXEDAO/ADD_VOTES';

export const EXEDAO_ADD_TOKEN = 'EXEDAO/ADD_TOKEN';
export const EXEDAO_ADD_TOKENS = 'EXEDAO/ADD_TOKENS';
export const EXEDAO_UPDATE_TOKEN = 'EXEDAO/UPDATE_TOKEN';

export const EXEDAO_ADD_BUY_REQUEST = 'EXEDAO/ADD_BUY_REQUEST';
export const EXEDAO_ADD_BUY_REQUESTS = 'EXEDAO/ADD_BUY_REQUESTS';

const initialState = {
  exedao: null,
  proposals: [],
  buyRequests: [],
  proposalsMeta: [],
  voteRequested: null,
  tokens: []
}

const defaultTransform = (oldItem, newItem) => ({ ...oldItem, ...newItem })

const updateItem = (arr, item, matchProperty, transform = defaultTransform) => arr.map((_item) => {
    if (_item[matchProperty] == item[matchProperty]) return transform(_item, item)
    return _item
})

export default (state = initialState, action) => {
    const {type, proposals, proposal, exedao, token, tokens, buyRequests, buyRequest} = action
    switch (type) {
        case EXEDAO_SET:
            console.log('set exedao')
            return { ...state, exedao, loading: false }

        case EXEDAO_ADD_PROPOSAL:
            if (state.proposals.some(prop => prop.proposalHash == proposal.proposalHash)) return state
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
            return {
                ...state,
                proposals: updateItem(state.proposals, proposal, 'proposalHash')
            }

        case EXEDAO_ADD_VOTES:
            return {
                ...state,
                proposals: updateItem(
                    state.proposals, proposal, 'proposalHash',
                    (_proposal, {votes}) => ({ ..._proposal, votes: _proposal.votes + votes})
                )
            }
        
        case EXEDAO_ADD_TOKEN:
            return {
                ...state,
                tokens: [...state.tokens, token]
            }

        case EXEDAO_ADD_TOKENS:
            return {
                ...state,
                tokens: [...state.tokens, ...tokens]
            }
        
        case EXEDAO_UPDATE_TOKEN:
            return {
                ...state,
                tokens: updateItem(state.tokens, token, 'tokenAddress')
            }

        case EXEDAO_ADD_BUY_REQUEST:
            return {
                ...state,
                buyRequests: [...state.buyRequests, buyRequest]
            }

        case EXEDAO_ADD_BUY_REQUESTS:
            return {
                ...state,
                buyRequests: [...state.buyRequests, ...buyRequests]
            }
            

        default:
            return state
    }
}