import {
  GET_NEW_ROUND_PROPOSALS_DATA,
  GET_DISPUTES_DATA,
} from "../ActionTypes";

export const governance = (
  state = {
    newRoundProposals: [],
    newRoundProposalId: 0,
    newRoundProposalActive: false,
    currentOnGoingRoundProposalId: -1,
    disputes: [],
    loading: true,
  },
  action
) => {
  switch (action.type) {
    case GET_NEW_ROUND_PROPOSALS_DATA: {
      return {
        ...state,
        newRoundProposals: action.payload.newRoundProposals,
        newRoundProposalId: action.payload.newRoundProposalId,
        newRoundProposalActive: action.payload.newRoundProposalActive,
        currentOnGoingRoundProposalId:
          action.payload.currentOnGoingRoundProposalId,
        loading: false,
      };
    }
    case GET_DISPUTES_DATA: {
      return {
        ...state,
        disputes: action.payload,
        loading: false,
      };
    }
    default:
      return state;
  }
};
