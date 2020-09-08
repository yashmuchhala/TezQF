import { GET_ROUND_STATUS, GET_ROUNDS_DATA } from "../ActionTypes";

export const round = (
  state = {
    isRoundActive: true,
    currentRound: -1,
    rounds: [],
  },
  action
) => {
  switch (action.type) {
    case GET_ROUND_STATUS: {
      return {
        ...state,
        isRoundActive: action.payload.isRoundActive,
      };
    }
    case GET_ROUNDS_DATA: {
      return {
        isRoundActive: action.payload.isRoundActive,
        currentRound: action.payload.currentRound,
        rounds: action.payload.rounds,
      };
    }

    default:
      return state;
  }
};
