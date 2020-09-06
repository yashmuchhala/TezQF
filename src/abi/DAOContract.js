class DAOContractABI {
  constructor(contract) {
    this.contract = contract;
  }

  async getNewRoundProposalsData() {
    const storage = await this.contract.storage();
    const newRoundProposals = {};
    for (var i = 0; i < storage.newRoundProposalId; i++) {
      newRoundProposals[i] = await storage.newRoundProposals.get(i + 1);
    }
    return {
      newRoundProposals: newRoundProposals,
      newRoundProposalId: storage.newRoundProposalId,
      newRoundProposalActive: storage.newRoundProposalActive,
      currentOnGoingRoundProposalId: storage.currentOnGoingRoundProposalId,
    };
  }

  async getDisputesData() {
    // const storage = await this.contract.storage();
    // TODO: Set a disputeCount to retrieve from BigMap or convert to Map
    return {};
  }

  async proposeNewRound(name, startTime, endTime, expiry) {
    // TODO: startTime, endTime, expiry in what format ???
    const op = await this.contract.methods
      .proposeNewRound(
        name,
        Math.round(startTime / 1000),
        Math.round(endTime / 1000),
        Math.round(expiry / 1000)
      )
      .send();
    const result = await op.confirmation();
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
    const op = await this.contract.methods.executeNewRoundProposal().send();

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
    const op = await this.contract.methods.listNewRound().send();

    const result = await op.confirmation();
    return result?.confirmed;
  }

  async settleRound() {
    const op = await this.contract.methods.settleRound().send();

    const result = await op.confirmation();
    return result?.confirmed;
  }

  async raiseDispute(entryId) {
    const op = await this.contract.methods.raiseDispute(entryId).send();

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
