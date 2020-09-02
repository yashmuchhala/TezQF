export const executive = {
  activeProposal: {
    id: 5,
    start: new Date(),
    end: new Date(Date.now() + 30 * 86400 * 1000),
    votesYes: 67000,
    votesNo: 5000,
    resolved: 0,
  },
  archivedProposals: [
    {
      id: 1,
      start: new Date(),
      end: new Date(Date.now() + 30 * 86400 * 1000),
      votesYes: 67000,
      votesNo: 5000,
      resolved: 1,
    },
    {
      id: 2,
      start: new Date(),
      end: new Date(Date.now() + 30 * 86400 * 1000),
      votesYes: 67000,
      votesNo: 75000,
      resolved: -1,
    },
    {
      id: 3,
      start: new Date(),
      end: new Date(Date.now() + 30 * 86400 * 1000),
      votesYes: 67000,
      votesNo: 5000,
      resolved: 1,
    },
    {
      id: 4,
      start: new Date(),
      end: new Date(Date.now() + 30 * 86400 * 1000),
      votesYes: 67000,
      votesNo: 5000,
      resolved: 1,
    },
  ],
};
