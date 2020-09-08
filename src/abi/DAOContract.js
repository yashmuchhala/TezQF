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
    // const storage = await this.contract.storage();
    // TODO: Set a disputeCount to retrieve from BigMap or convert to Map
    return {};
  }

  async proposeNewRound(name, startTime, endTime) {
    // TODO: startTime, endTime, expiry in what format ???
    const op = await this.contract.methods
      .proposeNewRound(endTime, name, startTime)
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
    const op = await this.contract.methods.listNewRound([["unit"]]).send();

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
