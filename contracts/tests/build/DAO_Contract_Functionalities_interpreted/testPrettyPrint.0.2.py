import smartpy as sp

class Contract(sp.Contract):
  def __init__(self):
    self.init(admin = sp.address('tz1hdQscorfqMzFqYxnrApuS5i6QSTuoAp3w'), currentOnGoingRoundProposalId = -1, disputeFee = 200, disputes = {}, holders = {}, minDisputeSettleVotes = 1, minNewRoundProposalStake = 200, minNewRoundProposalVotes = 0, minTokenMintProposalStake = 200, minTokenMintProposalVotes = 1, minimumVoteDifference = 0, newRoundProposalActive = False, newRoundProposalId = 0, newRoundProposals = {}, roundManager = sp.none, token = sp.none, tokenMintProposalActive = False, tokenMintProposalId = 0, tokenMintProposals = {})

  @sp.entry_point
  def addTokens(self, params):
    sp.set_type(params, sp.TRecord(address = sp.TAddress, value = sp.TNat).layout(("address", "value")))
    sp.verify(sp.sender == self.data.token.open_some())
    sp.if ~ (self.data.holders.contains(params.address)):
      self.data.holders[params.address] = sp.record(approvals = {}, balance = 0)
    self.data.holders[params.address].balance += params.value

  @sp.entry_point
  def decreaseApproval(self, params):
    sp.set_type(params, sp.TRecord(address = sp.TAddress, owner = sp.TAddress, value = sp.TNat).layout(("address", ("owner", "value"))))
    sp.verify(sp.sender == self.data.token.open_some())
    self.data.holders[params.owner].approvals[params.address] = sp.as_nat(self.data.holders[params.owner].approvals[params.address] - params.value)

  @sp.entry_point
  def donateToRound(self, params):
    sp.set_type(params, sp.TRecord(name = sp.TString).layout("name"))
    sp.verify(self.data.newRoundProposals[self.data.newRoundProposalId].resolved == 1)
    sp.verify(~ self.data.newRoundProposals[self.data.newRoundProposalId].listed)
    sp.verify(~ (self.data.newRoundProposals[self.data.newRoundProposalId].sponsorToFunds.contains(sp.sender)))
    self.data.newRoundProposals[self.data.newRoundProposalId].sponsorToFunds[sp.sender] = sp.record(amount = sp.amount, name = params.name)
    self.data.newRoundProposals[self.data.newRoundProposalId].totalFunds += sp.amount

  @sp.entry_point
  def executeNewRoundProposal(self, params):
    sp.verify((self.data.holders.contains(sp.sender)) & (self.data.holders[sp.sender].balance > 0))
    sp.verify(self.data.newRoundProposalActive)
    sp.verify(sp.now > self.data.newRoundProposals[self.data.newRoundProposalId].expiry)
    sp.verify(self.data.newRoundProposals[self.data.newRoundProposalId].resolved == 0)
    sp.if (((self.data.newRoundProposals[self.data.newRoundProposalId].votesYes * self.data.newRoundProposals[self.data.newRoundProposalId].votesYes) - (self.data.newRoundProposals[self.data.newRoundProposalId].votesNo * self.data.newRoundProposals[self.data.newRoundProposalId].votesNo)) > self.data.minimumVoteDifference) & (sp.len(self.data.newRoundProposals[self.data.newRoundProposalId].voters) >= self.data.minNewRoundProposalVotes):
      self.data.newRoundProposals[self.data.newRoundProposalId].resolved = 1
    sp.else:
      self.data.newRoundProposals[self.data.newRoundProposalId].resolved = -1
    sp.for voter in self.data.newRoundProposals[self.data.newRoundProposalId].voters.keys():
      sp.transfer(sp.record(from_ = sp.to_address(sp.self), to_ = voter, value = self.data.newRoundProposals[self.data.newRoundProposalId].voters[voter]), sp.tez(0), sp.contract(sp.TRecord(from_ = sp.TAddress, to_ = sp.TAddress, value = sp.TNat).layout(("from_", ("to_", "value"))), self.data.token.open_some(), entry_point='transfer').open_some())
    self.data.newRoundProposalActive = False

  @sp.entry_point
  def executeTokenMintProposal(self, params):
    sp.verify((self.data.holders.contains(sp.sender)) & (self.data.holders[sp.sender].balance > 0))
    sp.verify(self.data.tokenMintProposalActive)
    sp.verify(sp.now > self.data.tokenMintProposals[self.data.tokenMintProposalId].expiry)
    sp.verify(self.data.tokenMintProposals[self.data.tokenMintProposalId].resolved == 0)
    sp.if ((self.data.tokenMintProposals[self.data.tokenMintProposalId].votesYes - self.data.tokenMintProposals[self.data.tokenMintProposalId].votesNo) > self.data.minimumVoteDifference) & (sp.len(self.data.tokenMintProposals[self.data.tokenMintProposalId].voters) >= self.data.minTokenMintProposalVotes):
      sp.transfer(sp.record(address = self.data.admin, value = self.data.tokenMintProposals[self.data.tokenMintProposalId].amount), sp.tez(0), sp.contract(sp.TRecord(address = sp.TAddress, value = sp.TNat).layout(("address", "value")), self.data.token.open_some(), entry_point='mint').open_some())
      self.data.tokenMintProposals[self.data.tokenMintProposalId].resolved = 1
    sp.else:
      self.data.tokenMintProposals[self.data.tokenMintProposalId].resolved = -1
    sp.for voter in self.data.tokenMintProposals[self.data.tokenMintProposalId].voters.keys():
      sp.transfer(sp.record(from_ = sp.to_address(sp.self), to_ = voter, value = self.data.tokenMintProposals[self.data.tokenMintProposalId].voters[voter]), sp.tez(0), sp.contract(sp.TRecord(from_ = sp.TAddress, to_ = sp.TAddress, value = sp.TNat).layout(("from_", ("to_", "value"))), self.data.token.open_some(), entry_point='transfer').open_some())
    self.data.tokenMintProposalActive = False

  @sp.entry_point
  def initialMint(self, params):
    sp.verify((sp.sender == self.data.admin) & (~ self.data.token.is_some()))
    sp.set_type(params._token, sp.TAddress)
    sp.verify(sp.sender == self.data.admin)
    sp.verify(~ self.data.token.is_some())
    self.data.token = sp.some(params._token)
    sp.for member in params._members:
      sp.transfer(sp.record(address = member, value = params.value), sp.tez(0), sp.contract(sp.TRecord(address = sp.TAddress, value = sp.TNat).layout(("address", "value")), self.data.token.open_some(), entry_point='mint').open_some())

  @sp.entry_point
  def listNewRound(self, params):
    sp.verify((self.data.holders.contains(sp.sender)) & (self.data.holders[sp.sender].balance > 0))
    sp.verify(self.data.currentOnGoingRoundProposalId == -1)
    sp.verify(self.data.newRoundProposals[self.data.newRoundProposalId].resolved == 1)
    sp.verify(~ self.data.newRoundProposals[self.data.newRoundProposalId].listed)
    sp.transfer(sp.record(end = self.data.newRoundProposals[self.data.newRoundProposalId].end, name = self.data.newRoundProposals[self.data.newRoundProposalId].name, sponsors = self.data.newRoundProposals[self.data.newRoundProposalId].sponsorToFunds, start = self.data.newRoundProposals[self.data.newRoundProposalId].start, totalSponsorship = self.data.newRoundProposals[self.data.newRoundProposalId].totalFunds), sp.tez(0), sp.contract(sp.TRecord(end = sp.TTimestamp, name = sp.TString, sponsors = sp.TMap(sp.TAddress, sp.TRecord(amount = sp.TMutez, name = sp.TString).layout(("amount", "name"))), start = sp.TTimestamp, totalSponsorship = sp.TMutez).layout((("end", "name"), ("sponsors", ("start", "totalSponsorship")))), self.data.roundManager.open_some(), entry_point='createNewRound').open_some())
    self.data.newRoundProposals[self.data.newRoundProposalId].listed = True
    self.data.newRoundProposalActive = False
    self.data.currentOnGoingRoundProposalId = sp.to_int(self.data.newRoundProposalId)
    self.data.disputes = {}

  @sp.entry_point
  def proposeNewRound(self, params):
    sp.set_type(params, sp.TRecord(endTime = sp.TTimestamp, expiry = sp.TTimestamp, name = sp.TString, startTime = sp.TTimestamp).layout((("endTime", "expiry"), ("name", "startTime"))))
    sp.verify((self.data.holders.contains(sp.sender)) & (self.data.holders[sp.sender].balance > 0))
    sp.verify(~ self.data.newRoundProposalActive)
    sp.verify(params.endTime > params.startTime)
    sp.verify(params.startTime > params.expiry)
    self.data.newRoundProposalId += 1
    self.data.newRoundProposals[self.data.newRoundProposalId] = sp.record(created = sp.now, creator = sp.sender, end = params.endTime, expiry = params.expiry, listed = False, name = params.name, resolved = 0, sponsorToFunds = {}, start = params.startTime, totalFunds = sp.tez(0), voters = {}, votesNo = 0, votesYes = 0)
    self.data.newRoundProposalActive = True

  @sp.entry_point
  def proposeTokenMint(self, params):
    sp.set_type(params, sp.TRecord(expiry = sp.TTimestamp, mintAmount = sp.TNat).layout(("expiry", "mintAmount")))
    sp.verify((self.data.holders.contains(sp.sender)) & (self.data.holders[sp.sender].balance > 0))
    sp.verify(~ self.data.tokenMintProposalActive)
    self.data.tokenMintProposalId += 1
    self.data.tokenMintProposals[self.data.tokenMintProposalId] = sp.record(amount = params.mintAmount, creator = sp.sender, expiry = params.expiry, resolved = 0, voters = {}, votesNo = 0, votesYes = 0)
    self.data.tokenMintProposalActive = True

  @sp.entry_point
  def raiseDispute(self, params):
    sp.set_type(params, sp.TRecord(entryId = sp.TNat).layout("entryId"))
    sp.verify((self.data.holders.contains(sp.sender)) & (self.data.holders[sp.sender].balance > self.data.disputeFee))
    sp.verify(~ (self.data.disputes.contains(params.entryId)))
    sp.verify(self.data.holders[sp.sender].approvals.contains(sp.to_address(sp.self)))
    sp.verify(self.data.holders[sp.sender].approvals[sp.to_address(sp.self)] >= self.data.disputeFee)
    sp.transfer(sp.record(from_ = sp.sender, to_ = sp.to_address(sp.self), value = self.data.disputeFee), sp.tez(0), sp.contract(sp.TRecord(from_ = sp.TAddress, to_ = sp.TAddress, value = sp.TNat).layout(("from_", ("to_", "value"))), self.data.token.open_some(), entry_point='transfer').open_some())
    sp.transfer(sp.record(entryId = params.entryId), sp.tez(0), sp.contract(sp.TRecord(entryId = sp.TNat).layout("entryId"), self.data.roundManager.open_some(), entry_point='dispute').open_some())
    self.data.disputes[params.entryId] = sp.record(disputer = sp.sender, expiry = sp.add_seconds(sp.now, 500), resolved = 0, voters = {}, votesNo = 0, votesYes = 0)

  @sp.entry_point
  def removeTokens(self, params):
    sp.set_type(params, sp.TRecord(address = sp.TAddress, value = sp.TNat).layout(("address", "value")))
    sp.verify(sp.sender == self.data.token.open_some())
    self.data.holders[params.address].balance = sp.as_nat(self.data.holders[params.address].balance - params.value)

  @sp.entry_point
  def setApproval(self, params):
    sp.set_type(params, sp.TRecord(address = sp.TAddress, owner = sp.TAddress, value = sp.TNat).layout(("address", ("owner", "value"))))
    sp.verify(sp.sender == self.data.token.open_some())
    self.data.holders[params.owner].approvals[params.address] = params.value

  @sp.entry_point
  def setRoundManagerContract(self, params):
    sp.set_type(params, sp.TRecord(_roundManager = sp.TAddress).layout("_roundManager"))
    sp.verify(~ self.data.roundManager.is_some())
    sp.verify(sp.sender == self.data.admin)
    self.data.roundManager = sp.some(params._roundManager)

  @sp.entry_point
  def settleDispute(self, params):
    sp.set_type(params, sp.TRecord(entryId = sp.TNat).layout("entryId"))
    sp.verify((self.data.holders.contains(sp.sender)) & (self.data.holders[sp.sender].balance > 0))
    sp.verify(self.data.disputes.contains(params.entryId))
    sp.verify(sp.now > self.data.disputes[params.entryId].expiry)
    sp.verify(self.data.disputes[params.entryId].resolved == 0)
    sp.if ((self.data.disputes[params.entryId].votesYes * self.data.disputes[params.entryId].votesYes) > (self.data.disputes[params.entryId].votesNo * self.data.disputes[params.entryId].votesNo)) & ((self.data.disputes[params.entryId].votesYes * self.data.disputes[params.entryId].votesYes) > self.data.minDisputeSettleVotes):
      sp.transfer(sp.record(entryId = params.entryId), sp.tez(0), sp.contract(sp.TRecord(entryId = sp.TNat).layout("entryId"), self.data.roundManager.open_some(), entry_point='disqualify').open_some())
      self.data.disputes[params.entryId].resolved = 1
      sp.transfer(sp.record(from_ = sp.to_address(sp.self), to_ = sp.sender, value = self.data.disputeFee), sp.tez(0), sp.contract(sp.TRecord(from_ = sp.TAddress, to_ = sp.TAddress, value = sp.TNat).layout(("from_", ("to_", "value"))), self.data.token.open_some(), entry_point='transfer').open_some())
    sp.else:
      self.data.disputes[params.entryId].resolved = -1
    sp.for voter in self.data.disputes[params.entryId].voters.keys():
      sp.transfer(sp.record(from_ = sp.to_address(sp.self), to_ = voter, value = self.data.disputes[params.entryId].voters[voter]), sp.tez(0), sp.contract(sp.TRecord(from_ = sp.TAddress, to_ = sp.TAddress, value = sp.TNat).layout(("from_", ("to_", "value"))), self.data.token.open_some(), entry_point='transfer').open_some())

  @sp.entry_point
  def settleRound(self, params):
    sp.verify((self.data.holders.contains(sp.sender)) & (self.data.holders[sp.sender].balance > 0))
    sp.verify(self.data.currentOnGoingRoundProposalId >= 0)
    sp.verify(sp.now > self.data.newRoundProposals[sp.as_nat(self.data.currentOnGoingRoundProposalId)].end)
    sp.send(self.data.roundManager.open_some(), self.data.newRoundProposals[sp.as_nat(self.data.currentOnGoingRoundProposalId)].totalFunds)
    self.data.currentOnGoingRoundProposalId = -1

  @sp.entry_point
  def voteForDispute(self, params):
    sp.set_type(params, sp.TRecord(entryId = sp.TNat, inFavor = sp.TBool, value = sp.TNat).layout(("entryId", ("inFavor", "value"))))
    sp.verify(params.value > 0)
    sp.verify(self.data.holders.contains(sp.sender))
    sp.verify(self.data.holders[sp.sender].balance >= params.value)
    sp.verify(self.data.disputes.contains(params.entryId))
    sp.verify(sp.now < self.data.disputes[params.entryId].expiry)
    sp.set_type(params.inFavor, sp.TBool)
    sp.set_type(params.value, sp.TNat)
    sp.verify(~ (self.data.disputes[params.entryId].voters.contains(sp.sender)))
    sp.verify(sp.now < self.data.disputes[params.entryId].expiry)
    sp.verify(self.data.holders[sp.sender].approvals.contains(sp.to_address(sp.self)))
    sp.verify(self.data.holders[sp.sender].approvals[sp.to_address(sp.self)] >= params.value)
    y = sp.local("y", params.value)
    sp.while (y.value * y.value) > params.value:
      y.value = ((params.value // y.value) + y.value) // 2
    sp.verify(((y.value * y.value) <= params.value) & (params.value < ((y.value + 1) * (y.value + 1))))
    sp.if params.inFavor == True:
      self.data.disputes[params.entryId].votesYes += y.value
    sp.else:
      self.data.disputes[params.entryId].votesNo += y.value
    self.data.disputes[params.entryId].voters[sp.sender] = params.value
    sp.transfer(sp.record(from_ = sp.sender, to_ = sp.to_address(sp.self), value = params.value), sp.tez(0), sp.contract(sp.TRecord(from_ = sp.TAddress, to_ = sp.TAddress, value = sp.TNat).layout(("from_", ("to_", "value"))), self.data.token.open_some(), entry_point='transfer').open_some())

  @sp.entry_point
  def voteForNewRoundProposal(self, params):
    sp.set_type(params, sp.TRecord(inFavor = sp.TBool, value = sp.TNat).layout(("inFavor", "value")))
    sp.verify((self.data.holders.contains(sp.sender)) & (self.data.holders[sp.sender].balance > 0))
    sp.verify(self.data.newRoundProposalActive)
    sp.verify(params.value > 0)
    sp.verify(sp.now < self.data.newRoundProposals[self.data.newRoundProposalId].expiry)
    sp.verify(self.data.newRoundProposals[self.data.newRoundProposalId].resolved == 0)
    sp.set_type(params.inFavor, sp.TBool)
    sp.set_type(params.value, sp.TNat)
    sp.verify(~ (self.data.newRoundProposals[self.data.newRoundProposalId].voters.contains(sp.sender)))
    sp.verify(sp.now < self.data.newRoundProposals[self.data.newRoundProposalId].expiry)
    sp.verify(self.data.holders[sp.sender].approvals.contains(sp.to_address(sp.self)))
    sp.verify(self.data.holders[sp.sender].approvals[sp.to_address(sp.self)] >= params.value)
    y = sp.local("y", params.value)
    sp.while (y.value * y.value) > params.value:
      y.value = ((params.value // y.value) + y.value) // 2
    sp.verify(((y.value * y.value) <= params.value) & (params.value < ((y.value + 1) * (y.value + 1))))
    sp.if params.inFavor == True:
      self.data.newRoundProposals[self.data.newRoundProposalId].votesYes += y.value
    sp.else:
      self.data.newRoundProposals[self.data.newRoundProposalId].votesNo += y.value
    self.data.newRoundProposals[self.data.newRoundProposalId].voters[sp.sender] = params.value
    sp.transfer(sp.record(from_ = sp.sender, to_ = sp.to_address(sp.self), value = params.value), sp.tez(0), sp.contract(sp.TRecord(from_ = sp.TAddress, to_ = sp.TAddress, value = sp.TNat).layout(("from_", ("to_", "value"))), self.data.token.open_some(), entry_point='transfer').open_some())

  @sp.entry_point
  def voteForTokenMintProposal(self, params):
    sp.set_type(params, sp.TRecord(inFavor = sp.TBool, value = sp.TNat).layout(("inFavor", "value")))
    sp.verify((self.data.holders.contains(sp.sender)) & (self.data.holders[sp.sender].balance > 0))
    sp.verify(self.data.tokenMintProposalActive)
    sp.verify(params.value > 0)
    sp.verify(sp.now < self.data.tokenMintProposals[self.data.tokenMintProposalId].expiry)
    sp.verify(self.data.tokenMintProposals[self.data.tokenMintProposalId].resolved == 0)
    sp.set_type(params.inFavor, sp.TBool)
    sp.set_type(params.value, sp.TNat)
    sp.verify(~ (self.data.tokenMintProposals[self.data.tokenMintProposalId].voters.contains(sp.sender)))
    sp.verify(sp.now < self.data.tokenMintProposals[self.data.tokenMintProposalId].expiry)
    sp.verify(self.data.holders[sp.sender].approvals.contains(sp.to_address(sp.self)))
    sp.verify(self.data.holders[sp.sender].approvals[sp.to_address(sp.self)] >= params.value)
    y = sp.local("y", params.value)
    sp.while (y.value * y.value) > params.value:
      y.value = ((params.value // y.value) + y.value) // 2
    sp.verify(((y.value * y.value) <= params.value) & (params.value < ((y.value + 1) * (y.value + 1))))
    sp.if params.inFavor == True:
      self.data.tokenMintProposals[self.data.tokenMintProposalId].votesYes += y.value
    sp.else:
      self.data.tokenMintProposals[self.data.tokenMintProposalId].votesNo += y.value
    self.data.tokenMintProposals[self.data.tokenMintProposalId].voters[sp.sender] = params.value
    sp.transfer(sp.record(from_ = sp.sender, to_ = sp.to_address(sp.self), value = params.value), sp.tez(0), sp.contract(sp.TRecord(from_ = sp.TAddress, to_ = sp.TAddress, value = sp.TNat).layout(("from_", ("to_", "value"))), self.data.token.open_some(), entry_point='transfer').open_some())