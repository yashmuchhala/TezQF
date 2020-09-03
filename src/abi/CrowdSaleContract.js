class CrowdSaleContractABI {
  constructor(tezos, address) {
    this.contract = tezos.wallet.at(address);
  }

  async getPrice() {
    const storage = await this.contract.storage();
    return storage.price;
  }
  async buyTokens(value, mutezAmount) {
    const op = await this.contract.methods
      .buyTokens(value)
      .send({ amount: mutezAmount, mutez: true });
    return op.confirmation();
  }
}

export default CrowdSaleContractABI;
