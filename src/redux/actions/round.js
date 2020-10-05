import { GET_ROUND_STATUS, GET_ROUNDS_DATA } from "../ActionTypes";

export const getRoundStatusAction = async (roundManagerContract) => {
  const isRoundActive = await roundManagerContract.getIsRoundActive();
  return {
    type: GET_ROUND_STATUS,
    payload: {
      isRoundActive: isRoundActive,
    },
  };
};

export const getRoundsDataAction = async (roundManagerContract) => {
  const {
    rounds,
    isRoundActive,
    currentRound,
  } = await roundManagerContract.getRoundsData();
  return {
    type: GET_ROUNDS_DATA,
    payload: {
      isRoundActive: isRoundActive,
      rounds: rounds,
      currentRound: currentRound,
    },
  };
};
