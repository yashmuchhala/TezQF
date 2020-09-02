class RoundManagerContract {
  constructor(tezos, address) {
    this.contract = tezos.wallet.at(address);
  }
  async getRounds() {
    const storage = await this.contract.storage();
    return storage.rounds;
  }
  async getCurrentRound() {
    const storage = await this.contract.storage();
    return storage.currentRound;
  }
  async enterRound(description) {
    const op = await this.contract.methods.enterRound(description).send();
    return await op.confirmation();
  }

  async contribute(entryId, mutezAmount) {
    const op = await this.contract.methods
      .contribute(entryId)
      .send({ amount: mutezAmount, mutez: true });
    return await op.confirmation();
  }
  async dispute(entryId) {
    const op = await this.contract.methods.dispute(entryId).send();
    return await op.confirmation();
  }
}

export default RoundManagerContract;
