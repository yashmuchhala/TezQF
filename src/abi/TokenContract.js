class TokenContract {
  constructor(tezos, address) {
    this.contract = tezos.wallet.at(address);
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

export default TokenContract;
