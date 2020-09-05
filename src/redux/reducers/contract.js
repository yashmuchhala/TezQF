import { UPDATE_TEZOS, SET_CONTRACTS } from "../ActionTypes";

export const contract = (
  state = {
    tezos: null,
    contracts: {},
  },
  action
) => {
  switch (action.type) {
    case UPDATE_TEZOS: {
      return {
        ...state,
        tezos: action.payload.tezos,
      };
    }
    case SET_CONTRACTS: {
      return {
        ...state,
        contracts: action.payload.contracts,
      };
    }
    default:
      return state;
  }
};
