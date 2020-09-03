class TokenContractABI {
  constructor(tezos, address) {
    this.contract = tezos.wallet.at(address);
  }

  // Returns a BigMap
  async getBalances() {
    const storage = await this.contract.storage();
    return storage.balances;
  }

  async getTotalSuppy() {
    const storage = await this.contract.storage();
    return storage.totalSupply;
  }

  async getPaused() {
    const storage = await this.contract.storage();
    return storage.paused;
  }

  async transfer(from, to, value) {
    const op = await this.contract.methods.transfer(from, to, value).send();
    return await op.confirmation();
  }

  async approve(spender, value) {
    const op = await this.contract.methods.approve(spender, value).send();
    return await op.confirmation();
  }

  // Others are admin only entry points
}

export default TokenContractABI;
