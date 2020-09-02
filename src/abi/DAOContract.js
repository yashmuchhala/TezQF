class DAOContract {
  constructor(tezos, address) {
    this.contract = tezos.wallet.at(address);
  }

  async proposeNewRound(name, startTime, endTime, expiry) {
    // startTime and endTime in milliseconds sinze 1970 format
    const op = await this.contract.methods
      .proposeNewRound(name, startTime, endTime, expiry)
      .send();
    return await op.confirmation();
  }

  async voteForNewRoundProposal(inFavor, value) {
    const op = await this.contract.methods
      .voteForNewRoundProposal(inFavor, value)
      .send();
    return await op.confirmation();
  }

  async executeNewRoundProposal() {
    const op = await this.contract.methods.executeNewRoundProposal().send();
    return await op.confirmation();
  }

  async donateToRound(name, mutezAmount) {
    const op = await this.contract.methods
      .donateToRound(name)
      .send({ amount: mutezAmount, mutez: true });
    return await op.confirmation();
  }

  async listNewRound() {
    const op = await this.contract.methods.listNewRound().send();
    return await op.confirmation();
  }

  async settleRound() {
    const op = await this.contract.methods.settleRound().send();
    return await op.confirmation();
  }

  async raiseDispute(entryId) {
    const op = await this.contract.methods.raiseDispute(entryId).send();
    return await op.confirmation();
  }
  async voteForDispute(entryId, inFavor, value) {
    const op = await this.contract.methods
      .voteForDispute(entryId, inFavor, value)
      .send();
    return await op.confirmation();
  }

  async settleDispute(entryId) {
    const op = await this.contract.methods.settleDispute(entryId).send();
    return await op.confirmation();
  }
}

export default DAOContract;
