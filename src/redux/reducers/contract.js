import { UPDATE_TEZOS } from "../ActionTypes";

export const contract = (
  state = {
    tezos: null,
    contract: null,
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
    default:
      return state;
  }
};
