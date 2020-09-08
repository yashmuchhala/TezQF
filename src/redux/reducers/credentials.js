import { GET_WALLET_DATA } from "../ActionTypes";

export const credentials = (
  state = {
    wallet: {
      isConnected: false,
      account: "",
    },
  },
  action
) => {
  switch (action.type) {
    case GET_WALLET_DATA: {
      return {
        ...state,
        wallet: {
          isConnected: action.payload.isConnected,
          account: action.payload.account,
        },
      };
    }
    default:
      return state;
  }
};
