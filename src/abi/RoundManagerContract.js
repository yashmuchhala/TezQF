class RoundManagerContractABI {
  constructor(contract) {
    this.contract = contract;
  }
  async getRoundsData() {
    const storage = await this.contract.storage();
    const rounds = [];
    for (var i = 0; i <= storage.currentRound; i++) {
      rounds.push(await storage.rounds.get(i.toString()));
    }
    console.log("RM ABI:getRoundsData():rounds:", rounds);
    return {
      rounds: rounds,
      isRoundActive: storage.isRoundActive,
      currentRound: storage.currentRound,
    };
  }
  async getCurrentRound() {
    const storage = await this.contract.storage();
    return storage.currentRound.c[0];
  }

  async getIsRoundActive() {
    const storage = await this.contract.storage();
    return storage.isRoundActive;
  }

  async enterRound(description) {
    const op = await this.contract.methods.enterRound(description).send();

    const result = await op.confirmation();
    return result?.confirmed;
  }

  async contribute(entryId, mutezAmount) {
    const op = await this.contract.methods
      .contribute(entryId)
      .send({ amount: mutezAmount, mutez: true });

    const result = await op.confirmation();
    return result?.confirmed;
  }
  async dispute(entryId) {
    const op = await this.contract.methods.dispute(entryId).send();

    const result = await op.confirmation();
    return result?.confirmed;
  }
}

export default RoundManagerContractABI;
