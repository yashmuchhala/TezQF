import smartpy as sp

#FA1.2 Standard Template
class QuadToken(sp.Contract):
    def __init__(self, admin):
        self.init(paused = False, balances = sp.big_map(tvalue = sp.TRecord(approvals = sp.TMap(sp.TAddress, sp.TNat), balance = sp.TNat)), administrator = admin, totalSupply = 0)

    @sp.entry_point
    def transfer(self, params):
        #sp.set_type(params, sp.TRecord(from_ = sp.TAddress, to_ = sp.TAddress, value = sp.TNat).layout(("from_ as from", ("to_ as to", "value"))))
        sp.verify((sp.sender == self.data.administrator) |
            (~self.data.paused &
                ((params.from_ == sp.sender) |
                 (self.data.balances[params.from_].approvals[sp.sender] >= params.value))))
        self.addAddressIfNecessary(params.to_)
        sp.verify(self.data.balances[params.from_].balance >= params.value)
        self.data.balances[params.from_].balance = sp.as_nat(self.data.balances[params.from_].balance - params.value)
        self.data.balances[params.to_].balance += params.value
        sp.if (params.from_ != sp.sender) & (self.data.administrator != sp.sender):
            self.data.balances[params.from_].approvals[sp.sender] = sp.as_nat(self.data.balances[params.from_].approvals[sp.sender] - params.value)

    @sp.entry_point
    def approve(self, params):
        sp.set_type(params, sp.TRecord(spender = sp.TAddress, value = sp.TNat).layout(("spender", "value")))
        sp.verify(~self.data.paused)
        alreadyApproved = self.data.balances[sp.sender].approvals.get(params.spender, 0)
        sp.verify((alreadyApproved == 0) | (params.value == 0), "UnsafeAllowanceChange")
        self.data.balances[sp.sender].approvals[params.spender] = params.value

    @sp.entry_point
    def setPause(self, params):
        sp.set_type(params, sp.TBool)
        sp.verify(sp.sender == self.data.administrator)
        self.data.paused = params

    @sp.entry_point
    def setAdministrator(self, params):
        sp.set_type(params, sp.TAddress)
        sp.verify(sp.sender == self.data.administrator)
        self.data.administrator = params

    @sp.entry_point
    def mint(self, params):
        sp.set_type(params, sp.TRecord(address = sp.TAddress, value = sp.TNat))
        sp.verify(sp.sender == self.data.administrator)
        self.addAddressIfNecessary(params.address)
        self.data.balances[params.address].balance += params.value
        self.data.totalSupply += params.value

    @sp.entry_point
    def burn(self, params):
        sp.set_type(params, sp.TRecord(address = sp.TAddress, value = sp.TNat))
        sp.verify(sp.sender == self.data.administrator)
        sp.verify(self.data.balances[params.address].balance >= params.value)
        self.data.balances[params.address].balance = sp.as_nat(self.data.balances[params.address].balance - params.value)
        self.data.totalSupply = sp.as_nat(self.data.totalSupply - params.value)

    def addAddressIfNecessary(self, address):
        sp.if ~ self.data.balances.contains(address):
            self.data.balances[address] = sp.record(balance = 0, approvals = {})

    @sp.view(sp.TNat)
    def getBalance(self, params):
        sp.result(self.data.balances[params].balance)

    @sp.view(sp.TNat)
    def getAllowance(self, params):
        sp.result(self.data.balances[params.owner].approvals[params.spender])

    @sp.view(sp.TNat)
    def getTotalSupply(self, params):
        sp.set_type(params, sp.TUnit)
        sp.result(self.data.totalSupply)

    @sp.view(sp.TAddress)
    def getAdministrator(self, params):
        sp.set_type(params, sp.TUnit)
        sp.result(self.data.administrator)
    
    '''
    Notice:
        add on to revert the transaction if token balance requirements are not met 
    '''
    @sp.entry_point
    def balanceFailSafe(self, address, value):
        sp.verify(self.data.balances[address].balance > value)

class CrowdSale(sp.Contract):
    '''
    Params:
        _admin: the administrator
        _price: ICO token cost
        _daoWallet: wallet address of developers
        _period: Length of ICO in minutes 
    '''
    def __init__(self, _admin, _price, _daoWallet, _period):
        self.init(token = sp.none, 
                  price = _price, 
                  daoWallet = _daoWallet,
                  admin = _admin,
                  paused = False,
                  expiry = sp.timestamp_from_utc_now().add_minutes(_period),
                  totalSupply = 0
                )
    
    '''
    Params:
        value: the number of tokens to buy
    '''
    @sp.entry_point
    def buyTokens(self, value):
        sp.verify(sp.now < self.data.expiry)
        sp.verify(self.data.token.is_some())
        sp.verify(sp.sender != self.data.daoWallet)
        sp.verify(sp.mutez(value * self.data.price) == sp.amount)
        
        self.data.totalSupply += value
        
        tokenContract = sp.contract(sp.TRecord(address = sp.TAddress, value = sp.TNat), 
                                                self.data.token.open_some(), 
                                                "mint").open_some()

        #Mint tokens for sender
        sp.transfer(sp.record(address = sp.sender, value = value),
                    sp.tez(0),
                    tokenContract)
    '''
    Notice:
        Mints 10% of the totalSupply of the tokens exclusively to a wallet controlled by DAO members
    '''
    @sp.entry_point
    def mintForDao(self):
        sp.verify(~self.data.paused)
        sp.verify(sp.sender == self.data.daoWallet)
        sp.verify(sp.now >= self.data.expiry)
        self.data.paused = True

        tokenContract = sp.contract(sp.TRecord(address = sp.TAddress, value = sp.TNat), 
                                                self.data.token.open_some(), 
                                                "mint").open_some()
        #Mint 10% of totalSupply for daoWallet
        sp.transfer(sp.record(address = sp.sender, value = self.data.totalSupply // 10),
                    sp.tez(0),
                    tokenContract)
    
    @sp.entry_point
    def setTokenContract(self, address):
        sp.verify(~self.data.token.is_some())
        sp.verify(sp.sender == self.data.admin)

        self.data.token = sp.some(address)
            
class DAO(sp.Contract):
    def __init__(self, _admin, _token):
        self.init(
            # Communication related storage
            token = _token,
            roundManager = sp.none,
            admin = _admin,
            
            # Proposing to start a new funding round related storage
            newRoundProposals = sp.big_map(
                tkey = sp.TNat,
                tvalue = sp.TRecord(
                    id = sp.TNat,
                    description = sp.TString, #Holds the IPFS address of decription document
                    created = sp.TTimestamp,
                    creator = sp.TAddress,
                    start = sp.TTimestamp,
                    end = sp.TTimestamp,
                    votesYes = sp.TNat,
                    votesNo = sp.TNat,
                    voters = sp.TMap(sp.TAddress, sp.TRecord(value = sp.TNat, returned = sp.TBool)),
                    listed = sp.TBool,
                    resolved = sp.TInt,  # 0: Voting period, 1: Accepted, -1: Rejected
                    totalFunds = sp.TMutez,
                    sponsorToFunds = sp.TMap(
                        sp.TAddress,
                        sp.TRecord(
                            name = sp.TString, 
                            amount = sp.TMutez, 
                        )
                    ), 
                    expiry = sp.TTimestamp # votingExpiry = sp.TTimestamp,
                )
            ),
            newRoundProposalId = sp.nat(0),
            newRoundProposalActive = False,
            currentOnGoingRoundProposalId = sp.int(-1),
            lastAcceptedRound = sp.nat(0),
            
            # Dispute Voting related storage
            disputes = sp.big_map(tkey = sp.TInt, 
                    tvalue = sp.TMap(
                            sp.TNat, 
                            sp.TRecord(
                                disputer = sp.TAddress,
                                created = sp.TTimestamp,
                                description = sp.TString,
                                votesYes = sp.TNat,
                                votesNo = sp.TNat,
                                expiry = sp.TTimestamp,
                                voters = sp.TMap(sp.TAddress, sp.TRecord(value = sp.TNat, returned = sp.TBool)),
                                resolved = sp.TInt  # 0: Voting period, 1: Dispute won, -1: Dispute Lost 
                        )
            )),
            
            #All are initial testing values
            minNewRoundProposalBalance = sp.nat(2000),
            roundProposalVotesThreshold = sp.int(50),
            disputeStake = sp.nat(500),
            disputeVotesThreshold = sp.int(20),
        )


    # UTILITY FUNCTIONS

    """
    Notice:
        Utility method to allow the admin to set the round manager contract only if it is not already set
    Params:
        _roundManager (sp.TAddress): Address of the round manager contract associated with the quadratic funding rounds
    """
    @sp.entry_point
    def setRoundManagerContract(self, _roundManager):
        sp.verify(~self.data.roundManager.is_some())
        sp.verify(sp.sender == self.data.admin)
        self.data.roundManager = sp.some(_roundManager)
    
    
    """
    Notice:
        Utility entry point to allow the dispute voters to retrieve their stake back
    """
    @sp.entry_point
    def withdrawTokensDispute(self, roundId, entryId):
        dispute = self.data.disputes[roundId][entryId]
        sp.verify(dispute.voters.contains(sp.sender))
        sp.verify(~dispute.voters[sp.sender].returned)
        sp.verify(sp.now > dispute.expiry)

        sp.transfer(
                sp.record(
                    to_ = sp.sender,
                    from_ = sp.to_address(sp.self), 
                    value = dispute.voters[sp.sender].value
                ), 
                sp.tez(0),
                sp.contract(
                    sp.TRecord(
                        from_ = sp.TAddress,
                        to_ = sp.TAddress,
                        value = sp.TNat
                    ), 
                    self.data.token, 
                    "transfer"
                ).open_some()
            )
        dispute.voters[sp.sender].returned = True

    """
    Notice:
        Utility entry point to allow the round proposal voters to retrieve their stake back
    """
    @sp.entry_point
    def withdrawTokensProposal(self, roundId):
        proposal = self.data.newRoundProposals[roundId]
        sp.verify(proposal.voters.contains(sp.sender))
        sp.verify(~proposal.voters[sp.sender].returned)
        sp.verify(sp.now > proposal.expiry)

        sp.transfer(
                sp.record(
                    to_ = sp.sender,
                    from_ = sp.to_address(sp.self), 
                    value = proposal.voters[sp.sender].value
                ), 
                sp.tez(0),
                sp.contract(
                        sp.TRecord(
                            from_ = sp.TAddress,
                            to_ = sp.TAddress,
                            value = sp.TNat
                        ), 
                    self.data.token, 
                    "transfer"
                ).open_some()
            )
        proposal.voters[sp.sender].returned = True

    '''
    Notice:
        Calls the QuadToken failSafe to confirm token balance
    Params:
        value: the token required for confirmation
    '''
    def isHolder(self, value):
        tokenCBalance = sp.contract(sp.TRecord(address = sp.TAddress, value = sp.TNat), self.data.token, "balanceFailSafe").open_some()
        sp.transfer(sp.record(address=sp.sender, value=value), sp.tez(0), tokenCBalance)

    '''
    Params:
        subject (sp.TRecord): Proposal or issue to be voted on
        inFavour (sp.TBool): Boolean value indicating whether vote is in favour of the proposal
        value (sp.TNat): Amount of tokens to stake for the vote for quadratic voting
    '''
    def vote(self, subject, inFavor, value):
        # Setting a type to each parameter
        # sp.set_type(subject, sp.TRecord)
        sp.set_type(inFavor, sp.TBool)
        sp.set_type(value, sp.TNat)
        
        # Check whether the caller of the function has already voted (Is it needed? Can allow
        # a person to vote multiple times?)
        sp.verify(~subject.voters.contains(sp.sender))
        
        # Check whether the voting period is over
        sp.verify(sp.now < subject.expiry)
        
        # Determine square root part of the formula
        y = sp.local('y', value)
        x = value
        sp.while y.value * y.value > x:
            y.value = (x // y.value + y.value) // 2
        sp.verify((y.value * y.value <= x) & (x < (y.value + 1) * (y.value + 1)))
        
        # Add determined votes to the subject's voting details
        sp.if inFavor == True:
            subject.votesYes += y.value
        sp.else:
            subject.votesNo += y.value
            
        subject.voters[sp.sender] = sp.record(value = value, returned = False)
        
        # Transfer the tokens of 'value' from the voter to the DAO Contract 
        sp.transfer(
            sp.record(
                from_ = sp.sender, 
                to_ = sp.to_address(sp.self), 
                value = value
            ), 
            sp.tez(0),
            sp.contract(
                sp.TRecord(
                    from_ = sp.TAddress,
                    to_ = sp.TAddress,
                    value = sp.TNat
                ), 
                self.data.token, 
                "transfer"
            ).open_some()    
        )
        
        
    # NEW ROUNDS AND PROPOSALS ENTRY POINTS AND METHODS
    
    '''
    Params:
        name (sp.TString): Name of the new round being proposed
        startTime (sp.TTimestamp): Time when the proposed funding round will start
        endTime (sp.TTimestamp): Time when the proposed funding round will end
    '''
    @sp.entry_point
    def proposeNewRound(self, params):
        
        self.isHolder(self.data.minNewRoundProposalBalance)

        # Setting a type to each parameter
        sp.set_type(
            params,
            sp.TRecord(
                startTime = sp.TInt,
                endTime = sp.TInt,
                description = sp.TString
            )
        ).layout(
            (
                "startTime",
                "endTime",
                "description"
            )
        )
        
        
        # Check whether another newRoundProposal is already active or not
        sp.verify(~self.data.newRoundProposalActive)
        
        # Check whether the round start time and end time are after the voting expiry
        sp.verify(params.endTime > params.startTime)
        
        secondsToEnd = params.endTime - (sp.now - sp.timestamp(0))
        secondsToStart = params.startTime - (sp.now - sp.timestamp(0))
        
        # Add a new round proposal and set the newRoundProposalActive to True
        self.data.newRoundProposalId += 1
        self.data.newRoundProposals[self.data.newRoundProposalId] = sp.record(
            id = self.data.lastAcceptedRound + 1,
            description = params.description,
            created = sp.now,
            creator = sp.sender,
            start = sp.now.add_seconds(secondsToStart),
            end = sp.now.add_seconds(secondsToEnd),
            votesYes = 0,
            votesNo = 0,
            voters = sp.map(),
            listed = False,
            resolved = 0,
            totalFunds = sp.mutez(0),
            sponsorToFunds = sp.map(),
            expiry = sp.now.add_minutes(300), #Testing value only (5 Hours)
        )
        self.data.newRoundProposalActive = True

    '''
    Params:
        inFavor (sp.TBool): Boolean value indicating whether the vote is for or against the 
            proposal
        value (sp.TNat): Amount of tokens to put at stake that would be proportional to the 
            amount of votes added
    '''
    @sp.entry_point
    def voteForNewRoundProposal(self, params):
        # Setting a type to each parameter
        sp.set_type(
            params,
            sp.TRecord(
                inFavor = sp.TBool,
                value = sp.TNat
            )
        ).layout(
            (
                "inFavor",
                "value"
            )    
        )
        
        # Verify whether a proposal to mint tokens is active
        sp.verify(self.data.newRoundProposalActive)
        
        # Value should be greater than 0 as a minimum of 1 vote needs to be added
        sp.verify(params.value > 0)
        
        # Get the latest roundProposal and check whether the voting period is not expired
        proposal = self.data.newRoundProposals[self.data.newRoundProposalId]
        sp.verify(sp.now < proposal.expiry)
        sp.verify(proposal.resolved == sp.int(0))
        
        # Vote for the proposal (value has to be approved by the sender for the DAO address)
        self.vote(proposal, params.inFavor, params.value)
        
    '''
    Notice:
        Resolves an on-going proposal which is yet to be listed
    '''
    @sp.entry_point
    def executeNewRoundProposal(self):
        self.isHolder(value = sp.nat(0))

        # Verify whether a proposal to mint tokens is active       
        sp.verify(self.data.newRoundProposalActive)
        
        # Get the latest mintProposal and verify that the voting period is expired
        proposal = self.data.newRoundProposals[self.data.newRoundProposalId]
        sp.verify(sp.now > proposal.expiry)
        sp.verify(proposal.resolved == sp.int(0))
        
        # Check if all criteria for the proposal to be accepted is met, else reject it
        yesFinal = proposal.votesYes * proposal.votesYes
        noFinal = proposal.votesNo * proposal.votesNo
        sp.if (yesFinal - noFinal) >= self.data.roundProposalVotesThreshold:
            proposal.resolved = 1
        sp.else:
            proposal.resolved = -1
            self.data.newRoundProposalActive = False
    
    '''
    Notice:
        Allows donations for a round proposal resolved with status 1 and yet to be listed
    Params:
        name (sp.TString): Name of the sponsor
    '''
    @sp.entry_point
    def donateToRound(self, params):
        
        # Setting a type to each parameter
        sp.set_type(
            params,
            sp.TRecord(
                name = sp.TString
            )
        ).layout(
            (
                "name"
            )    
        )
        
        # Verify whether the proposal is accepted and not listed yet
        proposal = self.data.newRoundProposals[self.data.newRoundProposalId]
        sp.verify(proposal.resolved == 1)
        sp.verify(~proposal.listed)
        
        # Only one donation allowed for the time being.
        sp.verify(~proposal.sponsorToFunds.contains(sp.sender))
        
        # Register the funds and the sponsor to the new round which is about to be listed
        proposal.sponsorToFunds[sp.sender] = sp.record(
            name = params.name,
            amount = sp.amount
        )
        proposal.totalFunds += sp.amount
    
    '''
    Notice:
        Lists the accepted new round proposal to the RoundManager Contract
    '''
    @sp.entry_point
    def listNewRound(self):
    
        self.isHolder(self.data.minNewRoundProposalBalance)
        
        # Check whether a round is not already active
        sp.verify(self.data.currentOnGoingRoundProposalId == -1)
        
        # Verify whether the proposal is accepted and not listed yet
        proposal = self.data.newRoundProposals[self.data.newRoundProposalId]
        sp.verify(proposal.resolved == 1)
        sp.verify(~proposal.listed)
        
        # Set the new round 
        newRound = sp.record(
            start=proposal.start,
            end=proposal.end,
            id=proposal.id,
            totalSponsorship=proposal.totalFunds,
            sponsors=proposal.sponsorToFunds,
        )
        
        # Invoke the createNewRound entry point in the RoundManager contract to start a new 
        # funding round
        sp.transfer(
            newRound, 
            sp.tez(0), 
            sp.contract(
                sp.TRecord(
                    start=sp.TTimestamp,
                    end=sp.TTimestamp,
                    id=sp.TNat,
                    totalSponsorship=sp.TMutez,
                    sponsors=sp.TMap(
                        sp.TAddress,
                        sp.TRecord(
                            name = sp.TString, 
                            amount = sp.TMutez, 
                        )
                    )
                ),
                self.data.roundManager.open_some(),
                entry_point = "createNewRound"
            ).open_some()
        )
        
        # Update variable to track changes
        proposal.listed = True
        self.data.newRoundProposalActive = False
        self.data.currentOnGoingRoundProposalId = sp.to_int(self.data.newRoundProposalId)
        self.data.lastAcceptedRound += 1
        
        # new disputes map
        self.data.disputes[self.data.currentOnGoingRoundProposalId] = {}  
    
    '''
    Notice:
        Entry point to call the disburse function in RoundManager contract along with all the subsidy funds
    '''
    @sp.entry_point
    def settleRound(self):
        self.isHolder(0)
        
        # Check whether a round is going on according to DAO
        sp.verify(self.data.currentOnGoingRoundProposalId >= 0)
        # check whether current round has ended its funding time
        sp.verify(
            sp.now > self.data.newRoundProposals[sp.as_nat(
                self.data.currentOnGoingRoundProposalId
            )].end
        )
        
        sp.transfer(
            sp.unit,
            self.data.newRoundProposals[sp.as_nat(
                self.data.currentOnGoingRoundProposalId
            )].totalFunds
            ,
            sp.contract(
                sp.TUnit,
                self.data.roundManager.open_some(),
                "disburse"
            ).open_some()
        )
        
        self.data.currentOnGoingRoundProposalId = -1

    
    # DISPUTE VOTING ENTRY POINTS AND METHODS
    
    '''
    Notice:
        Allows a shareholder to set an entry in the funding round as disputed for a fixed stake
    Params:
        entryId (sp.TNat): Entry ID of the entry in the on-going funding round
    '''
    @sp.entry_point
    def raiseDispute(self, params):
        # Setting a type to each parameter
        sp.set_type(
            params,
            sp.TRecord(
                entryId = sp.TNat,
                description = sp.TString
            )
        ).layout(
            (
                "entryId",
                "description"
            )    
        )
        
        # Check whether the entry is not already disputed on
        sp.verify(~self.data.disputes[self.data.currentOnGoingRoundProposalId].contains(params.entryId))
        
        # Invoke the transfer entry point in the token contract to actually transfer the tokens
        c = sp.contract(
            sp.TRecord(
                from_ = sp.TAddress, 
                to_ = sp.TAddress, 
                value = sp.TNat
            ), 
            self.data.token, 
            "transfer"
        ).open_some()
        sp.transfer(
            sp.record(
                from_ = sp.sender, 
                to_ = sp.to_address(sp.self), 
                value = self.data.disputeStake
            ), 
            sp.tez(0),
            c
        )
        
        # Invoke the dispute entry point in the RoundManager contract to mark that entry as 
        # currently disputed
        sp.transfer(
            sp.record(
                entryId = params.entryId
            ), 
            sp.tez(0), 
            sp.contract(
                sp.TRecord(
                    entryId = sp.TNat
                ), 
                self.data.roundManager.open_some(),
                "dispute"
            ).open_some()
        )
        
        # Add the dispute proposal to the disputes map
        self.data.disputes[self.data.currentOnGoingRoundProposalId][params.entryId] = sp.record(
            disputer = sp.sender,
            created = sp.now,
            description = params.description,
            votesYes = 0,
            votesNo = 0,
            voters = sp.map(),
            resolved = 0,
            expiry = sp.now.add_seconds(500) #for testing only
        )
      
    '''
    Params:
        entryId (sp.TNat): ID of the entry in the funding round that is disputed
        inFavor (sp.TBool): Boolean value indicating whether the vote is for or against the proposal
        value (sp.TNat): Amount of tokens to put at stake that would be proportional to the amount of votes added
    '''
    @sp.entry_point
    def voteForDispute(self, params):
        # Setting a type to each parameter
        sp.set_type(
            params,
            sp.TRecord(
                entryId = sp.TNat,
                inFavor = sp.TBool,
                value = sp.TNat
            )
        ).layout(
            (
                "entryId",
                "inFavor",
                "value"
            )    
        )
        
        sp.verify(params.value > 0)
        
        # Check whether the entry ID is actually disputed
        sp.verify(self.data.disputes[self.data.currentOnGoingRoundProposalId].contains(params.entryId))
        
        # Get the disputed entry and verify that the dispute period is not expired
        disputedEntry = self.data.disputes[self.data.currentOnGoingRoundProposalId][params.entryId]
        sp.verify(sp.now < disputedEntry.expiry)
        
        # Vote for the dispute (value has to be approved by the sender for the DAO address)
        self.vote(disputedEntry, params.inFavor, params.value)

    '''
    Notice:
        Execute the settlement for the disputed entry after the voting period has expired
    Params:
        entryId (sp.TNat): Entry Id for the disputed entry to be settled
    '''
    @sp.entry_point
    def settleDispute(self, params):
        self.isHolder(0)

        # Setting a type to each parameter
        sp.set_type(
            params,
            sp.TRecord(
                entryId = sp.TNat
            )
        ).layout(
            (
                "entryId"
            )    

        )
        
        # Check if the entry ID is actually still disputed and its voting period is expired
        sp.verify(self.data.disputes[self.data.currentOnGoingRoundProposalId].contains(params.entryId))
        dispute = self.data.disputes[self.data.currentOnGoingRoundProposalId][params.entryId]
        sp.verify(sp.now > dispute.expiry)
        sp.verify(dispute.resolved == 0)
        
        
        yesFinal = dispute.votesYes * dispute.votesYes
        noFinal = dispute.votesNo * dispute.votesNo
        sp.if (yesFinal - noFinal) > self.data.disputeVotesThreshold: 
            sp.transfer(
                sp.record(
                    entryId = params.entryId
                ), 
                sp.tez(0), 
                sp.contract(
                    sp.TRecord(
                        entryId = sp.TNat
                    ), 
                    self.data.roundManager.open_some(), 
                    "disqualify"
                ).open_some()
            )
            dispute.resolved = 1
            
            # Return fee to disputer
            sp.transfer(
                sp.record(
                    to_ = sp.sender, 
                    from_ = sp.to_address(sp.self), 
                    value = self.data.disputeStake
                ), 
                sp.tez(0),
                sp.contract(
                    sp.TRecord(
                        from_ = sp.TAddress, 
                        to_ = sp.TAddress, 
                        value = sp.TNat
                    ), 
                    self.data.token, 
                    "transfer"
                ).open_some()
            )
            
        sp.else:
            dispute.resolved = -1
        
class RoundManager(sp.Contract):
    def __init__(self, _daoContractAddress):
        # When a new round begins, current_round will be changed to current_round + 1.
        # So the first round will have the key 1.
        # The description of each proposal is an IPFS Hash which contains the detailed 
        # description of the project.
        self.init(
            daoContractAddress = _daoContractAddress, 
            isRoundActive = False, 
            currentRound = sp.nat(0), 
            rounds = sp.big_map(
                tkey = sp.TNat, 
                tvalue = sp.TRecord(
                    id = sp.TNat, 
                    start = sp.TTimestamp,
                    end = sp.TTimestamp,
                    sponsors = sp.TMap(
                        sp.TAddress,
                        sp.TRecord(
                            name = sp.TString, 
                            amount = sp.TMutez, 
                        )
                    ), 
                    entryId = sp.TNat,
                    entries = sp.TMap(
                        sp.TNat,
                        sp.TRecord(
                            description = sp.TString, 
                            address = sp.TAddress, 
                            disputed = sp.TBool,
                            disputeEnd = sp.TTimestamp,
                            disqualified = sp.TBool,
                            contributions = sp.TMap(
                                sp.TAddress,
                                sp.TRecord(
                                    amount = sp.TNat, 
				                    timestamp = sp.TTimestamp
                                )
                            ),
                            totalContribution = sp.TMutez,
                            subsidyPower = sp.TNat,
                            sponsorshipWon = sp.TMutez,
                            retrieved = sp.TBool
                        )
                    ), 
                    totalSponsorship = sp.TMutez, 
                    totalContribution = sp.TMutez,
                    totalSubsidyPower = sp.TNat
                )
            )
        )
        
    '''
    Params:
        start (sp.TTimestamp): Start time of the new funding round
        end (sp.TTimestamp): End time of the new funding round
        id (sp.TNat): Id for the new funding round
        totalSponsorship (sp.TMutez): Total XTZ received for the subsidy pool
        sponsors (sp.TMap): Map for storing which sponsors donated how much
    '''
    @sp.entry_point 
    def createNewRound(self, params):
        # Setting a type to each parameter
        sp.set_type(
            params, 
            sp.TRecord(
                start=sp.TTimestamp,
                end=sp.TTimestamp,
                id=sp.TNat,
                totalSponsorship=sp.TMutez,
                sponsors=sp.TMap(
                    sp.TAddress,
                    sp.TRecord(
                        name = sp.TString, 
                        amount = sp.TMutez, 
                    )
                )
            )
        ).layout(
            (
                "start",
                "end",
                "id",
                "totalSponsorship",
                "sponsors"
            )    
        )
        
        
        # Check whether the caller of the entry point is the DAO Contract only    
        sp.verify(sp.sender == self.data.daoContractAddress)
        
        # Verify that another round is not active
        sp.verify(~self.data.isRoundActive)
        
        # Check whether the new round to be added is already ended
        sp.verify(params.end > sp.now)
        
        # Add a new round to the 'rounds' map and set 'isRoundActive' to True
        self.data.currentRound += 1
        self.data.rounds[self.data.currentRound] = sp.record(
            start=params.start,
            end=params.end,
            id=params.id,
            totalSponsorship=params.totalSponsorship,
            sponsors=params.sponsors,
            entries=sp.map(),
            totalContribution=sp.mutez(0),
            totalSubsidyPower=sp.nat(0),
            entryId=sp.nat(0),
        )
        self.data.isRoundActive = True
        
    '''
    Notice:
        Called by project teams to get themselves listed for contributions
    Params:
        description (sp.TString): An IPFS Hash of the document containing the description for the new entry
    '''
    @sp.entry_point
    def enterRound(self, params):
        # Setting a type to each parameter
        sp.set_type(
            params,
            sp.TRecord(
                description = sp.TString
            )
        ).layout(
            (
                "description"
            )    
        )
        
        
        # Check whether a round is active and if the round is accepting new entries
        sp.verify(self.data.isRoundActive)
        sp.verify(sp.now > self.data.rounds[self.data.currentRound].start)
        sp.verify(sp.now < self.data.rounds[self.data.currentRound].end)
        
        # Add the entry to the entries map of the current round
        self.data.rounds[self.data.currentRound].entryId += 1
        self.data.rounds[self.data.currentRound].entries[self.data.rounds[self.data.currentRound].entryId] = sp.record(
            description=params.description,
            address=sp.sender,
            disputeEnd = sp.now.add_seconds(5000), #testing only
            disputed=False,
            disqualified=False,
            contributions=sp.map(),
            totalContribution = sp.tez(0),
            subsidyPower = sp.nat(0),
            sponsorshipWon = sp.tez(0),
            retrieved = False
        )
        
    """
    Notice:
        Allows people to contribute XTZ to their desired entries
    params:
        entryId (sp.TNat): Entry ID for the entry to contribute XTZ to
    """
    @sp.entry_point
    def contribute(self, params):
        
        # Setting a type to each parameter
        sp.set_type(
            params,
            sp.TRecord(
                entryId = sp.TNat
            )
        ).layout(
            (
                "entryId"
            )    
        )
        
        # Check whether a round is active and if the round is accepting new contributions
        sp.verify(self.data.isRoundActive)
        sp.verify(sp.now > self.data.rounds[self.data.currentRound].start)
        sp.verify(sp.now < self.data.rounds[self.data.currentRound].end)
        
        # Contribution should be more than 0 mutez
        sp.verify(sp.amount > sp.mutez(0))
        
        # Entry ID should exist for the given round and should not be disqualified
        sp.verify(params.entryId >= 1)
        sp.verify(params.entryId <= self.data.rounds[self.data.currentRound].entryId)
        sp.verify(~self.data.rounds[self.data.currentRound].entries[params.entryId].disqualified)
        sp.verify(~self.data.rounds[self.data.currentRound].entries[params.entryId].contributions.contains(sp.sender))

        # Add a contribution to the entry of the desired amount
        self.data.rounds[self.data.currentRound].entries[params.entryId].contributions[sp.sender] = sp.record(
                amount = sp.fst(sp.ediv(sp.amount, sp.tez(1)).open_some()),
		        timestamp = sp.now
            )
        
        # Update contributions in the contract storage maps
        self.data.rounds[self.data.currentRound].entries[params.entryId].totalContribution += sp.amount
        self.data.rounds[self.data.currentRound].totalContribution += sp.amount
        
        #Subsidy power update
        amount = sp.fst(sp.ediv(sp.amount, sp.mutez(1)).open_some())
        root = sp.local('root', amount)
        sp.while root.value * root.value > amount:
            root.value = (amount // root.value + root.value) // 2
        sp.verify((root.value * root.value <= amount) & (amount < (root.value + 1) * (root.value + 1)))

        self.data.rounds[self.data.currentRound].entries[params.entryId].subsidyPower += root.value
        
    
    '''
    Notice:
        Called by the DAO contract to dispute an entry
    Params:
        entryId (sp.TNat): Entry ID for the entry to be disputed
    '''
    @sp.entry_point
    def dispute(self, params):
        
        # Setting a type to each parameter
        sp.set_type(
            params,
            sp.TRecord(
                entryId = sp.TNat
            )
        ).layout(
            (
                "entryId"
            )    
        )
        
        # Verify whether the sender is the DAO Contract only 
        sp.verify(sp.sender == self.data.daoContractAddress)
        
        # Check whether a round is active and if the round is accepting new disputes
        sp.verify(self.data.isRoundActive)
        sp.verify(sp.now > self.data.rounds[self.data.currentRound].start)
        sp.verify(sp.now < self.data.rounds[self.data.currentRound].end)
        
        # Entry ID should exist for the given round and should not be disqualified
        sp.verify(params.entryId >= 1)
        sp.verify(params.entryId <= self.data.rounds[self.data.currentRound].entryId)
        sp.verify(~self.data.rounds[self.data.currentRound].entries[params.entryId].disqualified)
        
        # Set the entry as disputed
        self.data.rounds[self.data.currentRound].entries[params.entryId].disputed = True
        self.data.rounds[self.data.currentRound].entries[params.entryId].disputeEnd = sp.now.add_seconds(500)
        
    
    '''
    Notice:
        Called by the DAO contract to disqualify a disputed entry if voting resolved with status 1
    Params:
        entryId (sp.TNat): Entry ID for the entry to be disqualified
    '''
    @sp.entry_point
    def disqualify(self, params):
        # Setting a type to each parameter
        sp.set_type(
            params,
            sp.TRecord(
                entryId = sp.TNat
            )
        ).layout(
            (
                "entryId"
            )    
        )
        
        # Verify whether the sender is the DAO Contract only 
        sp.verify(sp.sender == self.data.daoContractAddress)
        
        # Check whether a round is active and if the round is accepting new disputes
        sp.verify(self.data.isRoundActive)
        sp.verify(sp.now > self.data.rounds[self.data.currentRound].start)
        sp.verify(sp.now < self.data.rounds[self.data.currentRound].end)
        
        
        # Entry ID should exist for the given round and should not be disqualified
        sp.verify(params.entryId >= 1)
        sp.verify(params.entryId <= self.data.rounds[self.data.currentRound].entryId)
        sp.verify(
            sp.now > self.data.rounds[self.data.currentRound].entries[params.entryId].disputeEnd
        )
        sp.verify(~self.data.rounds[self.data.currentRound].entries[params.entryId].disqualified)
        
        # Disqualify the entry and return all contributions
        self.data.rounds[self.data.currentRound].entries[params.entryId].disqualified = True

    '''
    Notice: 
        Allows contributors of a disputed entry to withdraw their contributions
    '''
    @sp.entry_point
    def withdrawContribution(self, roundId, entryId):
        entry = self.data.rounds[roundId].entries[entryId]
        sp.verify(entry.disqualified)
        sp.verify(entry.contributions.contains(sp.sender))
        sp.verify(entry.contributions[sp.sender].amount > 0)

        sp.send(sp.sender, sp.tez(entry.contributions[sp.sender].amount))
        entry.contributions[sp.sender].amount = 0
    
    '''
    Notice:
        Entry point for the entries to recieve their money once the funding round is over;
        Can only be called by the DAO contract along with all the sponsorship money
    '''
    @sp.entry_point
    def disburse(self):
        sp.verify(sp.sender == self.data.daoContractAddress)
        
        # Check whether a round is active and if the round is accepting new disputes
        sp.verify(self.data.isRoundActive == True)
        sp.verify(sp.now > self.data.rounds[self.data.currentRound].start)
        sp.verify(sp.now > self.data.rounds[self.data.currentRound].end)
        
        # Verify whether the full sponsorship amount is sent
        sp.verify(sp.amount == self.data.rounds[self.data.currentRound].totalSponsorship)
        
        # Loop over all entries and find their subsidy power using quadratic formula
        sp.for i in sp.range(1, self.data.rounds[self.data.currentRound].entryId + 1):
            sp.if ~self.data.rounds[self.data.currentRound].entries[i].disqualified:
                self.data.rounds[self.data.currentRound].entries[i].subsidyPower = (self.data.rounds[self.data.currentRound].entries[i].subsidyPower * self.data.rounds[self.data.currentRound].entries[i].subsidyPower) 
                
                # Maintain a totalSubsidyPower variable for division later
                self.data.rounds[self.data.currentRound].totalSubsidyPower += self.data.rounds[self.data.currentRound].entries[i].subsidyPower
            
        sp.verify(self.data.rounds[self.data.currentRound].totalSubsidyPower > 0)
            
        self.data.isRoundActive = False
    
    '''
    Notice:
        Allows listed entries to retrieve their CLR match amount
    '''
    @sp.entry_point
    def retrieveMatch(self, roundId, entryId):
        sp.verify(self.data.rounds[roundId].totalSubsidyPower > 0)
        sp.verify(self.data.rounds[roundId].entries[entryId].address == sp.sender)
        sp.verify(~self.data.rounds[roundId].entries[entryId].disqualified)
        sp.verify(~self.data.rounds[roundId].entries[entryId].retrieved)

        self.data.rounds[roundId].entries[entryId].sponsorshipWon = sp.split_tokens(
            self.data.rounds[roundId].totalSponsorship, 
            self.data.rounds[roundId].entries[entryId].subsidyPower,
            self.data.rounds[roundId].totalSubsidyPower
        )
                
        sp.send(
            self.data.rounds[roundId].entries[entryId].address, 
            self.data.rounds[roundId].entries[entryId].sponsorshipWon + 
            self.data.rounds[roundId].entries[entryId].totalContribution
        )

        self.data.rounds[roundId].entries[entryId].retrieved = True


if "templates" not in __name__:
    @sp.add_test(name="Full Test")
    def testDAOContractFunctionalities():
        """Testing scenarios for the Decentralized Autonomous Organization Contract
        
        Testing scenarios for the Decentralized Autonomous Organization to check whether all 
        entry points, storage variables, logics and security verification methods are sound. 
        Also checks the DAO Contract's token related and round related functionalities work 
        as expected.
        """
        
       # ==============
       # Dummy Accounts
       # ==============
       
        admin = sp.test_account("Administrator")  # Initial admin of the DAO contract
        alice = sp.test_account("Alice")  # Shareholder/Token Holder
        bob = sp.test_account("Bob")  # Shareholder/Token Holder
        grace = sp.test_account("Grace")  # Shareholder/Token Holder
        gus = sp.test_account("Gus")  # Shareholder/Token Holder
        eve = sp.test_account("Eve")  # Shareholder/Token Holder
        john = sp.test_account("John")  # Shareholder/Token Holder
        judy = sp.test_account("Judy")  # Shareholder/Token Holder
        trudy = sp.test_account("Trudy")  # Shareholder/Token Holder
        carol = sp.test_account("Carol")  # Sponsor
        carlos = sp.test_account("Carlos")  # Sponsor
        charlie = sp.test_account("Charlie")  # Entry Owner
        chuck = sp.test_account("Chuck")  # Entry Owner
        dan = sp.test_account("Dan")  # Entry Owner
        dave = sp.test_account("Dave")  # Contributor
        david = sp.test_account("David")  # Contributor
        mike = sp.test_account("Mike")  # Contributor
        
        
        # Initialize contracts (only the required ones
        crowdsaleContract = CrowdSale(_admin = admin.address, _price = 1000000, _daoWallet = admin.address, _period = 1)
        tokenContract = QuadToken(crowdsaleContract.address)
        daoContract = DAO(admin.address, tokenContract.address)
        roundManagerContract = RoundManager(daoContract.address)
        
        scenario = sp.test_scenario()
    
        scenario.h1("Full Test")
        
        # Add contracts to scene
        scenario.h3("Initial DAO Contract")
        scenario += daoContract
        scenario.h3('Initial CrowdSale Contract')
        scenario += crowdsaleContract
        scenario.h3("Initial QuadToken Contract")
        scenario += tokenContract
        scenario.h3("Initial RoundManager Contract")
        scenario += roundManagerContract
        
        
        scenario.h3('Set Contracts(Token & RM)')
        scenario += crowdsaleContract.setTokenContract(tokenContract.address).run(sender = admin)
        scenario += daoContract.setRoundManagerContract(roundManagerContract.address).run(sender = admin)
        
        # =========
        # CROWDSALE
        # =========
        
        scenario.h1('CrowdSale (3 participants)')
        scenario += crowdsaleContract.buyTokens(3000).run(sender = alice, amount = sp.tez(3000))
        scenario += crowdsaleContract.buyTokens(2700).run(sender = bob, amount = sp.tez(2700))
        scenario += crowdsaleContract.buyTokens(3500).run(sender = john, amount = sp.tez(3500))
        scenario += crowdsaleContract.buyTokens(2500).run(sender = grace, amount = sp.tez(2500))
        
        scenario.h3('Mint for DAO Wallet (Before ICO ends)')
        scenario += crowdsaleContract.mintForDao().run(sender = admin, now = sp.timestamp_from_utc_now(), valid = False)
        
        scenario.h3('Mint for DAO Wallet')
        scenario += crowdsaleContract.mintForDao().run(sender = admin, now = 1600000000)
        
        scenario.h3('Mint for DAO Wallet (Once again)')
        scenario += crowdsaleContract.mintForDao().run(sender = admin, now = 1600000000, valid = False)
        
        scenario.h3('Final Balances after CrowdSale')
        scenario.show(tokenContract.data.balances)
        
        # ============================
        # ROUND PROPOSALS SETUP IN DAO 
        # ============================
        
        scenario.h3("Propose a New Funding Round")
        scenario += daoContract.proposeNewRound(
            description="Round 1", 
            startTime=100000, 
            endTime=110000
        ).run(sender=alice, now=80000)
        
        scenario.h3("Propose New Funding Round (FAILED)") # Not by shareholder
        scenario += daoContract.proposeNewRound(
            description="Round 1", 
            startTime=100000, 
            endTime=110000
        ).run(sender=mike, now=80000, valid = False)
        
        scenario.h3("Propose New Funding Round (FAILED)") # Already 1 is active
        scenario += daoContract.proposeNewRound(
            description="Round 1", 
            startTime=100000, 
            endTime=110000
        ).run(sender=bob, now=80000, valid=False)
        
        
        # Set Token Staking Approvals
        
        scenario += tokenContract.approve(
            spender=daoContract.address,
            value=100000000
        ).run(sender=alice)
        
        scenario += tokenContract.approve(
            spender=daoContract.address,
            value=100000000
        ).run(sender=bob)
        
        scenario += tokenContract.approve(
            spender=daoContract.address,
            value=1000000000
        ).run(sender=john)
        
        
        # Voting phase for round proposal
        
        scenario.h3("Vote for New Round Proposal")
        scenario += daoContract.voteForNewRoundProposal(
                inFavor=True,
                value=1000
        ).run(sender=alice, now=85000)
    
        scenario.h3("Vote for New Round Proposal Again (FAILED)")
        scenario += daoContract.voteForNewRoundProposal(
                inFavor=True,
                value=1000
        ).run(sender=alice, now=85000, valid=False)
        
        scenario.h3("Vote for New Round Proposal")
        scenario += daoContract.voteForNewRoundProposal(
                inFavor=True,
                value=1000
        ).run(sender=bob, now=85000)
        
        scenario.h3("Vote for New Round Proposal")
        scenario += daoContract.voteForNewRoundProposal(
                inFavor=False,
                value=2000
        ).run(sender=john, now=85000)
        
        scenario.verify(sp.len(daoContract.data.newRoundProposals[1].voters) == 3)
        scenario.h3("\n[&#x2713] Alice, Bob and John voted for newRoundProposal successfully")
        
        
        # Withdraw Tokens after voting period ends
        
        scenario.h3('Alice, Bob and John withdraw their tokens')
        scenario += daoContract.withdrawTokensProposal(1).run(sender = alice, now = 99000)
        scenario += daoContract.withdrawTokensProposal(1).run(sender = bob, now = 99000)
        scenario += daoContract.withdrawTokensProposal(1).run(sender = john, now = 99000)
        
        scenario.h3('Alice tries to withdraw again (FAILED)')
        scenario += daoContract.withdrawTokensProposal(1).run(sender = alice, now = 99000, valid = False)
        
        scenario.h3('Final balances after withdrawal')
        scenario.show(tokenContract.data.balances)
        
        
        # Execute Proposal
        
        scenario.h3("Execute New Round Proposal")
        scenario += daoContract.executeNewRoundProposal().run(sender = alice, now=98500)
        
        
        # Donations phase
        
        scenario.h3("Donate")
        scenario += daoContract.donateToRound(
            name = "Blockchain Foundation",
        ).run(sender=carlos, amount=sp.tez(5000))
                    
        scenario.h3("List New Round Proposal to the RoundManager Contract")
        scenario += daoContract.listNewRound().run(sender=john, now=99000)
        
        scenario.h2("Donate to a listed round (FAILED)")
        scenario += daoContract.donateToRound(name = "Alice").run(
            amount = sp.tez(5), 
            sender = alice, 
            valid = False
        )
        
        scenario.verify(roundManagerContract.data.currentRound == 1)
        scenario.verify(roundManagerContract.data.isRoundActive)
        scenario.h3("\n[&#x2713] New round listed successfully")
        
        
        # =======================
        # ROUND MANAGER FUNCTIONS
        # =======================
        
        # Add 3 entries
        
        scenario.h3("Adding an entry to a round")
        scenario += roundManagerContract.enterRound(
            description = "IPFS Hash 1"
        ).run(sender=charlie, now=105000)
        
        scenario.h3("Adding an entry to a round")
        scenario += roundManagerContract.enterRound(
            description = "IPFS Hash 2"
        ).run(sender=chuck, now=105000)
        
        scenario.h3("Adding an entry to a round")
        scenario += roundManagerContract.enterRound(
            description = "IPFS Hash 2"
        ).run(sender=dan, now=105000)
        
        scenario.verify(
            roundManagerContract.data.rounds[roundManagerContract.data.currentRound].entryId == 3
        )
        
        
        # Contributions phase
        
        scenario.h3("Contribute to entries")
        scenario += roundManagerContract.contribute(
            entryId = 1   
        ).run(sender=dave, amount=sp.tez(100), now=106000)
        
        scenario += roundManagerContract.contribute(
            entryId = 1   
        ).run(
            sender=dave, 
            amount=sp.tez(100), 
            now=116000,
            valid=False
        )  # Contributing after round ends
        
        scenario += roundManagerContract.contribute(
            entryId = 2   
        ).run(sender=dave, amount=sp.tez(200), now=106000)
        
        scenario += roundManagerContract.contribute(
            entryId = 2
        ).run(sender=david, amount=sp.tez(50), now=106000)

        scenario += roundManagerContract.contribute(
            entryId = 3   
        ).run(sender=david, amount=sp.tez(100), now=106000)

        scenario += roundManagerContract.contribute(
            entryId = 3   
        ).run(sender=mike, amount=sp.tez(500), now=106000)

        scenario += roundManagerContract.contribute(
            entryId = 1   
        ).run(sender=mike, amount=sp.tez(100), now=106000)
        
        
        # Raising disputes
        
        scenario.h3('Bob raises a dispute')
        scenario += daoContract.raiseDispute(entryId = 1, description = "Dispute 1").run(sender = bob, now = 106000)
        scenario.verify(roundManagerContract.data.rounds[1].entries[1].disputed == True)
        
        scenario.h3('Raise Dispute Again (FAILED)')
        scenario += daoContract.raiseDispute(
            entryId = 1,
            description = "Dispute 1"
        ).run(sender = bob, now = 106000, valid = False)
        
        
        # Voting period for dispute
        
        scenario.h3('Vote for dispute')
        scenario += daoContract.voteForDispute(
            entryId = 1, 
            inFavor = True, 
            value = 500
        ).run(sender = bob, now = 106050)
        
        scenario += daoContract.voteForDispute(
            entryId = 1, 
            inFavor = True, 
            value = 500
        ).run(sender = alice, now = 106050)
        
        scenario.h3('Vote for dispute')
        scenario += daoContract.voteForDispute(
            entryId = 1, 
            inFavor = False, 
            value = 1000
        ).run(sender = john, now = 106050)
        
        scenario.h3('Vote for dispute after expiry (FAILED)')
        scenario += daoContract.voteForDispute(
            entryId = 1, 
            inFavor = True, 
            value = 100
        ).run(sender = bob, now = 115000, valid = False)
        
        
        # Withdrawals of dispute voting stake
        
        scenario.h3('Alice, Bob and John withdraw their tokens')
        scenario += daoContract.withdrawTokensDispute(roundId = 1,entryId = 1).run(sender = alice, now = 110000)
        scenario += daoContract.withdrawTokensDispute(roundId = 1,entryId = 1).run(sender = bob, now = 110000)
        scenario += daoContract.withdrawTokensDispute(roundId = 1,entryId = 1).run(sender = john, now = 110000)
        
        scenario.h3('Alice tries to withdraw again (FAILED)')
        scenario += daoContract.withdrawTokensDispute(roundId = 1,entryId = 1).run(sender = alice, now = 110000, valid = False)
        
        scenario.h3('Final balances after withdrawal')
        scenario.show(tokenContract.data.balances)
        
        
        # Dispute settlement
        
        scenario.h3('Settle Dispute before expiry (FAILED)')
        scenario += daoContract.settleDispute(
            entryId = 1
        ).run(sender = alice, now = 106000, valid = False)
        
        scenario += daoContract.settleDispute(
            entryId = 1
        ).run(sender = alice, now = 107000)
        
        scenario.verify(roundManagerContract.data.rounds[1].entries[1].disqualified == True)
        
        
        # Withdrawal of contributions for a disqualified entry
        
        scenario.h3('Dave and Mike withdraw their contributions')
        scenario += roundManagerContract.withdrawContribution(roundId = 1, entryId = 1).run(sender = dave)
        scenario += roundManagerContract.withdrawContribution(roundId = 1, entryId = 1).run(sender = mike)
        
        scenario.h3('Dave tries to withdraw again (FAILED)')
        scenario += roundManagerContract.withdrawContribution(roundId = 1, entryId = 1).run(sender = dave, valid = False)
        
        
        # End round
        
        scenario.h2("End round")
        scenario += daoContract.settleRound().run(sender=alice, now=140000)
        scenario.verify(roundManagerContract.data.isRoundActive == False)
        

        # Match Retrieval
        
        scenario.h2("Chuck and Dan retrieve their matches")
        scenario += roundManagerContract.retrieveMatch(roundId = 1, entryId = 2).run(sender = chuck)
        scenario += roundManagerContract.retrieveMatch(roundId = 1, entryId = 3).run(sender = dan)
        
        scenario.h2("Chuck tries to retrieve again (FAILED)")
        scenario += roundManagerContract.retrieveMatch(roundId = 1, entryId = 2).run(sender = chuck, valid = False)
        
        scenario.h3("\n[&#x2713] Funding Round ended successfully")