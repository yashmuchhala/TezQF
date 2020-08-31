import smartpy as sp

class Contract(sp.Contract):
  def __init__(self):
    self.init(administrator = sp.contract_address(Contract2), balances = {}, daoContract = sp.contract_address(Contract0), paused = False, totalSupply = 0)

  @sp.entry_point
  def approve(self, params):
    sp.set_type(params, sp.TRecord(spender = sp.TAddress, value = sp.TNat).layout(("spender", "value")))
    sp.verify(~ self.data.paused)
    sp.if ~ (self.data.balances[sp.sender].approvals.contains(params.spender)):
      self.data.balances[sp.sender].approvals[params.spender] = 0
    self.data.balances[sp.sender].approvals[params.spender] += params.value
    sp.transfer(sp.record(address = params.spender, owner = sp.sender, value = self.data.balances[sp.sender].approvals[params.spender]), sp.tez(0), sp.contract(sp.TRecord(address = sp.TAddress, owner = sp.TAddress, value = sp.TNat).layout(("address", ("owner", "value"))), self.data.daoContract, entry_point='syncApproval').open_some())

  @sp.entry_point
  def mint(self, params):
    sp.set_type(params, sp.TRecord(address = sp.TAddress, value = sp.TNat).layout(("address", "value")))
    sp.verify(sp.sender == self.data.administrator)
    sp.if ~ (self.data.balances.contains(params.address)):
      self.data.balances[params.address] = sp.record(approvals = {}, balance = 0)
    self.data.balances[params.address].balance += params.value
    self.data.totalSupply += params.value
    sp.transfer(sp.record(address = params.address, value = self.data.balances[params.address].balance), sp.tez(0), sp.contract(sp.TRecord(address = sp.TAddress, value = sp.TNat).layout(("address", "value")), self.data.daoContract, entry_point='syncBalance').open_some())

  @sp.entry_point
  def setAdministrator(self, params):
    sp.set_type(params, sp.TRecord(newAdmin = sp.TAddress).layout("newAdmin"))
    sp.verify(sp.sender == self.data.administrator)
    self.data.administrator = params.newAdmin

  @sp.entry_point
  def setPause(self, params):
    sp.set_type(params, sp.TRecord(pause = sp.TBool).layout("pause"))
    sp.verify(sp.sender == self.data.administrator)
    self.data.paused = params.pause

  @sp.entry_point
  def transfer(self, params):
    sp.set_type(params, sp.TRecord(from_ = sp.TAddress, to_ = sp.TAddress, value = sp.TNat).layout(("from_", ("to_", "value"))))
    sp.verify((~ self.data.paused) & ((params.from_ == sp.sender) | ((self.data.balances[params.from_].approvals.contains(sp.sender)) & (self.data.balances[params.from_].approvals[sp.sender] >= params.value))))
    sp.if ~ (self.data.balances.contains(params.to_)):
      self.data.balances[params.to_] = sp.record(approvals = {}, balance = 0)
    sp.verify(self.data.balances[params.from_].balance >= params.value)
    self.data.balances[params.from_].balance = sp.as_nat(self.data.balances[params.from_].balance - params.value)
    self.data.balances[params.to_].balance += params.value
    sp.if params.from_ != sp.sender:
      self.data.balances[params.from_].approvals[sp.sender] = sp.as_nat(self.data.balances[params.from_].approvals[sp.sender] - params.value)
      sp.transfer(sp.record(address = sp.sender, owner = params.from_, value = self.data.balances[params.from_].approvals[sp.sender]), sp.tez(0), sp.contract(sp.TRecord(address = sp.TAddress, owner = sp.TAddress, value = sp.TNat).layout(("address", ("owner", "value"))), self.data.daoContract, entry_point='syncApproval').open_some())
    sp.transfer(sp.record(address = params.from_, value = self.data.balances[params.from_].balance), sp.tez(0), sp.contract(sp.TRecord(address = sp.TAddress, value = sp.TNat).layout(("address", "value")), self.data.daoContract, entry_point='syncBalance').open_some())
    sp.transfer(sp.record(address = params.to_, value = self.data.balances[params.to_].balance), sp.tez(0), sp.contract(sp.TRecord(address = sp.TAddress, value = sp.TNat).layout(("address", "value")), self.data.daoContract, entry_point='syncBalance').open_some())