import { updateItem } from "./util";

export const EXEDAO_SET = "EXEDAO/SET";
export const EXEDAO_ADD_TOKEN = "EXEDAO/ADD_TOKEN";
export const EXEDAO_ADD_TOKENS = "EXEDAO/ADD_TOKENS";
export const EXEDAO_UPDATE_TOKEN = "EXEDAO/UPDATE_TOKEN";

const initialState = {
  exedao: null,
  tokens: [],
};

export default (state = initialState, action) => {
  const { type, exedao, token, tokens } = action;
  switch (type) {
    case EXEDAO_SET:
      console.log("set exedao");
      return { ...state, exedao, loading: false };

    case EXEDAO_ADD_TOKEN:
      return {...state, tokens: [...state.tokens, token]};

    case EXEDAO_ADD_TOKENS:
      return {...state, tokens: [...state.tokens, ...tokens]};

    case EXEDAO_UPDATE_TOKEN:
      return {...state, tokens: updateItem(state.tokens, token, "tokenAddress")};

    default:
      return state;
  }
};
