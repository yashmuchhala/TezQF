import smartpy as sp

class Contract(sp.Contract):
  def __init__(self):
    self.init(currentRound = -1, daoContractAddress = sp.contract_address(Contract0), isRoundActive = False, rounds = {})

  @sp.entry_point
  def contribute(self, params):
    sp.set_type(params, sp.TRecord(entryId = sp.TNat).layout("entryId"))
    sp.verify(self.data.isRoundActive)
    sp.verify(sp.now > self.data.rounds[self.data.currentRound].start)
    sp.verify(sp.now < self.data.rounds[self.data.currentRound].end)
    sp.verify(sp.amount > sp.tez(0))
    sp.verify(params.entryId >= 0)
    sp.verify(params.entryId <= self.data.rounds[self.data.currentRound].entryId)
    sp.verify(~ self.data.rounds[self.data.currentRound].entries[params.entryId].disqualified)
    self.data.rounds[self.data.currentRound].entries[params.entryId].contributions.push(sp.record(address = sp.sender, amount = sp.fst(sp.ediv(sp.amount, sp.tez(1)).open_some()), clrMatch = sp.tez(0), timestamp = sp.now))
    self.data.rounds[self.data.currentRound].entries[params.entryId].totalContribution += sp.amount
    self.data.rounds[self.data.currentRound].totalContribution += sp.amount

  @sp.entry_point
  def createNewRound(self, params):
    sp.set_type(params, sp.TRecord(end = sp.TTimestamp, name = sp.TString, sponsors = sp.TMap(sp.TAddress, sp.TRecord(amount = sp.TMutez, name = sp.TString).layout(("amount", "name"))), start = sp.TTimestamp, totalSponsorship = sp.TMutez).layout((("end", "name"), ("sponsors", ("start", "totalSponsorship")))))
    sp.verify(sp.sender == self.data.daoContractAddress)
    sp.verify(~ self.data.isRoundActive)
    sp.verify(params.end > sp.now)
    self.data.currentRound += 1
    self.data.rounds[self.data.currentRound] = sp.record(end = params.end, entries = {}, entryId = -1, name = params.name, sponsors = params.sponsors, start = params.start, totalContribution = sp.tez(0), totalSponsorship = params.totalSponsorship, totalSubsidyPower = 0)
    self.data.isRoundActive = True

  @sp.entry_point
  def disburse(self, params):
    sp.verify(sp.sender == self.data.daoContractAddress)
    sp.verify(self.data.isRoundActive == True)
    sp.verify(sp.now > self.data.rounds[self.data.currentRound].start)
    sp.verify(sp.now > self.data.rounds[self.data.currentRound].end)
    sp.verify(sp.amount == self.data.rounds[self.data.currentRound].totalSponsorship)
    sp.for i in sp.range(0, self.data.rounds[self.data.currentRound].entryId + 1):
      sp.if ~ self.data.rounds[self.data.currentRound].entries[i].disqualified:
        sp.for contribution in self.data.rounds[self.data.currentRound].entries[i].contributions:
          root = sp.local("root", contribution.amount * 10000)
          sp.while (root.value * root.value) > (contribution.amount * 10000):
            root.value = (((contribution.amount * 10000) // root.value) + root.value) // 2
          sp.verify(((root.value * root.value) <= (contribution.amount * 10000)) & ((contribution.amount * 10000) < ((root.value + 1) * (root.value + 1))))
          self.data.rounds[self.data.currentRound].entries[i].subsidyPower += root.value
        self.data.rounds[self.data.currentRound].entries[i].subsidyPower = (self.data.rounds[self.data.currentRound].entries[i].subsidyPower * self.data.rounds[self.data.currentRound].entries[i].subsidyPower) // 10000
        self.data.rounds[self.data.currentRound].totalSubsidyPower += self.data.rounds[self.data.currentRound].entries[i].subsidyPower
    sp.verify(self.data.rounds[self.data.currentRound].totalSubsidyPower > 0)
    totalSponsorship = sp.local("totalSponsorship", sp.amount)
    sp.for i in sp.range(0, self.data.rounds[self.data.currentRound].entryId + 1):
      sp.if ~ self.data.rounds[self.data.currentRound].entries[i].disqualified:
        self.data.rounds[self.data.currentRound].entries[i].sponsorshipWon = sp.split_tokens(sp.amount, self.data.rounds[self.data.currentRound].entries[i].subsidyPower, self.data.rounds[self.data.currentRound].totalSubsidyPower)
        sp.send(self.data.rounds[self.data.currentRound].entries[i].address, self.data.rounds[self.data.currentRound].entries[i].sponsorshipWon + self.data.rounds[self.data.currentRound].entries[i].totalContribution)
        totalSponsorship.value -= self.data.rounds[self.data.currentRound].entries[i].sponsorshipWon
    self.data.isRoundActive = False

  @sp.entry_point
  def dispute(self, params):
    sp.set_type(params, sp.TRecord(entryId = sp.TNat).layout("entryId"))
    sp.verify(sp.sender == self.data.daoContractAddress)
    sp.verify(self.data.isRoundActive)
    sp.verify(sp.now > self.data.rounds[self.data.currentRound].start)
    sp.verify(sp.now < self.data.rounds[self.data.currentRound].end)
    sp.verify(params.entryId >= 0)
    sp.verify(params.entryId <= self.data.rounds[self.data.currentRound].entryId)
    sp.verify(~ self.data.rounds[self.data.currentRound].entries[params.entryId].disqualified)
    self.data.rounds[self.data.currentRound].entries[params.entryId].disputed = True
    self.data.rounds[self.data.currentRound].entries[params.entryId].disputeEnd = sp.add_seconds(sp.now, 600)

  @sp.entry_point
  def disqualify(self, params):
    sp.set_type(params, sp.TRecord(entryId = sp.TNat).layout("entryId"))
    sp.verify(sp.sender == self.data.daoContractAddress)
    sp.verify(self.data.isRoundActive)
    sp.verify(sp.now > self.data.rounds[self.data.currentRound].start)
    sp.verify(sp.now < self.data.rounds[self.data.currentRound].end)
    sp.verify(params.entryId >= 0)
    sp.verify(params.entryId <= self.data.rounds[self.data.currentRound].entryId)
    sp.verify(sp.now > self.data.rounds[self.data.currentRound].entries[params.entryId].disputeEnd)
    sp.verify(~ self.data.rounds[self.data.currentRound].entries[params.entryId].disqualified)
    self.data.rounds[self.data.currentRound].entries[params.entryId].disqualified = True
    sp.for contribution in self.data.rounds[self.data.currentRound].entries[params.entryId].contributions:
      sp.send(contribution.address, sp.tez(contribution.amount))
      self.data.rounds[self.data.currentRound].totalContribution -= sp.tez(contribution.amount)

  @sp.entry_point
  def enterRound(self, params):
    sp.set_type(params, sp.TRecord(description = sp.TString).layout("description"))
    sp.verify(self.data.isRoundActive)
    sp.verify(sp.now > self.data.rounds[self.data.currentRound].start)
    sp.verify(sp.now < self.data.rounds[self.data.currentRound].end)
    self.data.rounds[self.data.currentRound].entryId += 1
    self.data.rounds[self.data.currentRound].entries[self.data.rounds[self.data.currentRound].entryId] = sp.record(address = sp.sender, contributions = sp.list([]), description = params.description, disputeEnd = sp.add_seconds(sp.now, 5000), disputed = False, disqualified = False, sponsorshipWon = sp.tez(0), subsidyPower = 0, totalContribution = sp.tez(0))