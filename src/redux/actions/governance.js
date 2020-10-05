import {
  GET_NEW_ROUND_PROPOSALS_DATA,
  GET_DISPUTES_DATA,
} from "../ActionTypes";
export const getNewRoundProposalsDataAction = async (daoContract) => {
  const {
    newRoundProposals,
    newRoundProposalId,
    newRoundProposalActive,
    currentOnGoingRoundProposalId,
  } = await daoContract.getNewRoundProposalsData();
  return {
    type: GET_NEW_ROUND_PROPOSALS_DATA,
    payload: {
      newRoundProposals: newRoundProposals,
      newRoundProposalActive: newRoundProposalActive,
      newRoundProposalId: newRoundProposalId,
      currentOnGoingRoundProposalId: currentOnGoingRoundProposalId,
    },
  };
};

export const getDisputesDataAction = async (daoContract) => {
  const disputes = await daoContract.getDisputesData();
  return {
    type: GET_DISPUTES_DATA,
    payload: disputes,
  };
};
