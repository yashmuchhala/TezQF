class TokenContractABI {
  constructor(contract) {
    this.contract = contract;
  }

  // Returns a BigMap
  async getBalances() {
    const storage = await this.contract.storage();
    return storage.balances;
  }
  async getBalance(address) {
    const storage = await this.contract.storage();
    const balanceMap = await storage.balances.get(address);

    if (balanceMap === undefined) {
      // Not in the map
      return {
        balance: 0,
        approvals: {},
      };
    }

    return {
      balance: balanceMap === null ? 0 : balanceMap?.balance.c[0],
      approvals: balanceMap?.approvals?.valueMap,
    };
  }

  async getTotalSuppy() {
    const storage = await this.contract.storage();
    return storage.totalSupply.c[0];
  }

  async getPaused() {
    const storage = await this.contract.storage();
    return storage.paused;
  }

  async transfer(from, to, value) {
    const op = await this.contract.methods.transfer(from, to, value).send();

    const result = await op.confirmation();
    return result?.confirmed;
  }

  async approve(spender, value) {
    const op = await this.contract.methods.approve(spender, value).send();
    const result = await op.confirmation();
    return result?.completed;
  }

  // Others are admin only entry points
}

export default TokenContractABI;
