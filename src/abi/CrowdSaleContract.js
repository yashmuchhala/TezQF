class CrowdSaleContractABI {
  constructor(contract) {
    this.contract = contract;
  }

  async getPrice() {
    const storage = await this.contract.storage();
    return storage.price.c[0];
  }

  async getTotalSupply() {
    const storage = await this.contract.storage();
    return storage.totalSupply.c[0];
  }

  async buyTokens(value, mutezAmount) {
    const op = await this.contract.methods
      .buyTokens(value)
      .send({ amount: mutezAmount, mutez: true });
    const result = await op.confirmation();
    return result?.completed;
  }
}

export default CrowdSaleContractABI;
