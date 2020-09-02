export const disputes = {
  activeDisputes: [
    {
      entryId: 25,
      title: "Plagiarized",
      description: "The project is a copy of an already existing work.",
      votesYes: 12000,
      votesNo: 3000,
      resolved: 0,
    },
    {
      entryId: 47,
      title: "Scam",
      description: "The project appears to be a ponzi scheme.",
      votesYes: 17000,
      votesNo: 2000,
      resolved: 0,
    },
  ],
  archivedDisputes: [
    {
      roundId: 1,
      disputes: [
        {
          entryId: 25,
          title: "Plagiarized",
          description: "The project is a copy of an already existing work.",
          votesYes: 12000,
          votesNo: 3000,
          resolved: 1,
        },
        {
          entryId: 47,
          title: "Scam",
          description: "The project appears to be a ponzi scheme.",
          votesYes: 17000,
          votesNo: 2000,
          resolved: 1,
        },
      ],
    },
    {
      roundId: 2,
      disputes: [
        {
          entryId: 25,
          title: "Plagiarized",
          description: "The project is a copy of an already existing work.",
          votesYes: 2000,
          votesNo: 13000,
          resolved: -1,
        },
      ],
    },
    {
      roundId: 3,
      disputes: [],
    },
    {
      roundId: 4,
      disputes: [
        {
          entryId: 25,
          title: "Plagiarized",
          description: "The project is a copy of an already existing work.",
          votesYes: 12000,
          votesNo: 3000,
          resolved: 1,
        },
        {
          entryId: 47,
          title: "Scam",
          description: "The project appears to be a ponzi scheme.",
          votesYes: 17000,
          votesNo: 2000,
          resolved: 1,
        },
      ],
    },
  ],
};
