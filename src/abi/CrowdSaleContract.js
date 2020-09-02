class CrowdSaleContract {
  constructor(tezos, address) {
    this.contract = tezos.wallet.at(address);
  }

  async buyTokens(value, mutezAmount) {
    const op = await this.contract.methods
      .buyTokens(value)
      .send({ amount: mutezAmount, mutez: true });
    return op.confirmation();
  }
}

export default CrowdSaleContract;
