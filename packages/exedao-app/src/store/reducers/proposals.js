export const REQUEST_UPDATE = 'proposals/REQUEST_UPDATE'
export const RECEIVE_UPDATE = 'proposals/RECEIVE_UPDATE'
export const RECEIVE_SIGNAL = 'proposals/RECEIVE_SIGNAL'

const initialState = {
  proposals: {},
  loadPending: false,
  updatesNeeded: []
}

function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}

export default (state = initialState, action) => {
  const {done, type, proposals, updatesNeeded} = action;
  switch(type) {
    case REQUEST_UPDATE:
      return {
        ...state,
        loadPending: true
      }

    case RECEIVE_UPDATE:
      const updatesNeeded = [...state.updatesNeeded]
        .filter(hash =>
          !proposals.some(p => p.proposalHash == hash));
      return {
        ...state,
        proposals: {...state.proposals, ...proposals},
        updatesNeeded,
        loadPending: false
      }

    case RECEIVE_SIGNAL:
      return {
        ...state,
        updatesNeeded: [...state.updatesNeeded, ...updatesNeeded].filter(onlyUnique)
      }
  }
}