class DAOContractABI {
  constructor(contract) {
    this.contract = contract;
  }

  async getNewRoundProposalsData() {
    const storage = await this.contract.storage();
    const newRoundProposals = [];
    for (var i = 1; i <= storage.newRoundProposalId; i++) {
      newRoundProposals.push(await storage.newRoundProposals.get(i.toString()));
    }
    return {
      newRoundProposals: newRoundProposals,
      newRoundProposalId: storage.newRoundProposalId,
      newRoundProposalActive: storage.newRoundProposalActive,
      currentOnGoingRoundProposalId: storage.currentOnGoingRoundProposalId,
    };
  }

  async getDisputesData() {
    const storage = await this.contract.storage();
    const disputes = [];
    for (var i = 1; i <= storage.lastAcceptedRound; i++) {
      disputes.push(await storage.disputes.get(i.toString()));
    }
    return disputes;
  }

  async withdrawTokensDispute(entryId, roundId) {
    const op = await this.contract.methods
      .withdrawTokensDispute(entryId, roundId)
      .send();
    const result = await op.confirmation();
    return result?.confirmed;
  }

  async withdrawTokensProposal(roundId) {
    const op = await this.contract.methods
      .withdrawTokensProposal(roundId)
      .send();
    const result = await op.confirmation();
    return result?.confirmed;
  }

  async proposeNewRound(description, startTime, endTime) {
    const op = await this.contract.methods
      .proposeNewRound(description, endTime, startTime)
      .send();
    const result = await op.confirmation();
    console.log(result);
    return result?.confirmed;
  }

  async voteForNewRoundProposal(inFavor, value) {
    const op = await this.contract.methods
      .voteForNewRoundProposal(inFavor, value)
      .send();
    const result = await op.confirmation();
    return result?.confirmed;
  }

  async executeNewRoundProposal() {
    const op = await this.contract.methods
      .executeNewRoundProposal([["unit"]])
      .send();

    const result = await op.confirmation();
    return result?.confirmed;
  }

  async donateToRound(name, mutezAmount) {
    const op = await this.contract.methods
      .donateToRound(name)
      .send({ amount: mutezAmount, mutez: true });

    const result = await op.confirmation();
    return result?.confirmed;
  }

  async listNewRound() {
    const op = await this.contract.methods
      .listNewRound([["unit"]])
      .send({ gasLimit: 1040000 });

    const result = await op.confirmation();
    return result?.confirmed;
  }

  async settleRound() {
    const op = await this.contract.methods.settleRound([["unit"]]).send();

    const result = await op.confirmation();
    return result?.confirmed;
  }

  async raiseDispute(entryId, description) {
    const op = await this.contract.methods
      .raiseDispute(description, entryId)
      .send();

    const result = await op.confirmation();
    return result?.confirmed;
  }
  async voteForDispute(entryId, inFavor, value) {
    const op = await this.contract.methods
      .voteForDispute(entryId, inFavor, value)
      .send();

    const result = await op.confirmation();
    return result?.confirmed;
  }

  async settleDispute(entryId) {
    const op = await this.contract.methods.settleDispute(entryId).send();

    const result = await op.confirmation();
    return result?.confirmed;
  }
}

export default DAOContractABI;
