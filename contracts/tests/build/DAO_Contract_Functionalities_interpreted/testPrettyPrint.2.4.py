import smartpy as sp

class Contract(sp.Contract):
  def __init__(self):
    self.init(admin = sp.address('tz1hdQscorfqMzFqYxnrApuS5i6QSTuoAp3w'), daoMultiSig = sp.address('tz1aemCpTnBwQjs7ZqboNJDX6wy76TrhBK8R'), price = 1000000, token = sp.none)

  @sp.entry_point
  def buyTokens(self, params):
    sp.verify(self.data.token.is_some())
    sp.verify(sp.sender != self.data.daoMultiSig)
    sp.verify(sp.mutez(params * self.data.price) == sp.amount)
    sp.transfer(sp.record(address = sp.sender, value = params), sp.tez(0), sp.contract(sp.TRecord(address = sp.TAddress, value = sp.TNat).layout(("address", "value")), self.data.token.open_some(), entry_point='mint').open_some())
    sp.transfer(sp.record(address = self.data.daoMultiSig, value = params // 10), sp.tez(0), sp.contract(sp.TRecord(address = sp.TAddress, value = sp.TNat).layout(("address", "value")), self.data.token.open_some(), entry_point='mint').open_some())

  @sp.entry_point
  def setTokenContract(self, params):
    sp.verify(~ self.data.token.is_some())
    sp.verify(sp.sender == self.data.admin)
    self.data.token = sp.some(params)