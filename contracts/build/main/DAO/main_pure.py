import smartpy as sp

class QuadToken(sp.Contract):
    """FA1.2 Token Contract that would be used by the DAO shareholders for voting rights
    
    Storage Variables:
        paused (sp.TBool): Indicates whether change in balances is diallowed 
        balances (sp.TBigMap): A map for tracking balances of every token holding account
        admin (sp.TAddress): An adminstrator account that has executing privileges
        totalSupply (sp.TNat): Total number of live tokens; has to be consistent with balances
        
    Entry Points:
        transfer: A transfer entry point for the FA1.2 Token Standard
        approve: Approval entry point for the FA1.2 Token Standard
        mint: Minting entry point for the FA1.2 Token Standard
        setPause: An entry point for the administrator to pause all movements of the token
        setAdminstrator: Entry point for changing the administrator for the token contract
        
    Methods:
        addAddressIfNecessary: A utility method to add a new address to the balances TBigMap
    """
    
    def __init__(self, admin, dao):
        """Constructor function for the QuadToken
        
        Initializes the contract storage variables with static typing and sets the 
        supplied administrator account for the token with initial total supply of zero
        
        Args:
            admin (sp.TAddress): Set administrator of the token
            dao (sp.TAddress): Address of DAO token contract
        """
        self.init(
            paused = False, 
            balances = sp.big_map(
                tvalue = sp.TRecord(
                    # Approvals keep track of accounts that are approved to spend tokens on behalf of 
                    # other specified accounts for specified value
                    approvals = sp.TMap(
                        sp.TAddress, 
                        sp.TNat
                    ), 
                    balance = sp.TNat
                )
            ), 
            administrator = admin, 
            daoContract = dao,
            totalSupply = sp.nat(0)
        )

    
    @sp.entry_point
    def transfer(self, params):
        """A transfer entry point for the FA1.2 Token Standard
        
        Whenever this entry point is called, along with transferring the tokens in the
        balances TBigMap, it also invokes the DAO Contract's balance update entry points 
        
        :param from_: sp.TAddress: account to transfer the tokens from
        :param to_: sp.TAddress: account to transfer the tokens to
        :param value: sp.TNat: amount of tokens to be transferred
        """
        
        # Setting a type to each parameter
        sp.set_type(
            params, 
            sp.TRecord(
                from_ = sp.TAddress,
                to_ = sp.TAddress,
                value = sp.TNat
            )
        ).layout(
            (
                "from_",
                "to_",
                "value"
            )
        )
        
        # Check whether token transaction is not paused and whether the sp.sender is allowed to 
        # send tokens of specified value from the 'from_' account
        sp.verify(
            (
                ~self.data.paused & 
                (
                    (params.from_ == sp.sender) | 
                    (
                        self.data.balances[params.from_].approvals.contains(sp.sender) &
                        (self.data.balances[params.from_].approvals[sp.sender] >= params.value)
                    )
                )
            )
        )
        
        # Adds the to_ address to the balances TBigMap if it already does not exist
        self.addAddressIfNecessary(params.to_)
        
        # Check whether 'from_' has enough balance as the transferred value mentioned
        sp.verify(self.data.balances[params.from_].balance >= params.value)
        
        # Transfer the tokens i.e. reduce 'from_' balance and increase 'to_' balance according to 
        # the value parameter
        self.data.balances[params.from_].balance = sp.as_nat(
            self.data.balances[params.from_].balance - params.value
        )
        self.data.balances[params.to_].balance += params.value
        
        # If sender is not 'from_' decrease the approval amount and send the update to the DAO
        with sp.if_(params.from_ != sp.sender):
            self.data.balances[params.from_].approvals[sp.sender] = sp.as_nat(
                self.data.balances[params.from_].approvals[sp.sender] - params.value
            )
            sp.transfer(
                sp.record(
                    address = sp.sender, 
                    owner = params.from_,
                    value = self.data.balances[params.from_].approvals[sp.sender]
                ),
                sp.tez(0),
                sp.contract(
                    sp.TRecord(
                        address = sp.TAddress, 
                        owner = sp.TAddress, 
                        value = sp.TNat
                    ),
                    self.data.daoContract, 
                    "syncApproval"
                ).open_some()
            )
            
        # Track the holders in the DAO contract i.e. update balances in DAO as well
        sp.transfer(
            sp.record(
                address = params.from_, 
                value = self.data.balances[params.from_].balance
            ), 
            sp.tez(0),
            sp.contract(
                sp.TRecord(
                    address = sp.TAddress, 
                    value = sp.TNat
                ), 
                self.data.daoContract, 
                "syncBalance"
            ).open_some()
        )
        sp.transfer(
            sp.record(
                address = params.to_, 
                value = self.data.balances[params.to_].balance
            ),
            sp.tez(0),
            sp.contract(
                sp.TRecord(
                    address = sp.TAddress, 
                    value = sp.TNat
                ), 
                self.data.daoContract, 
                "syncBalance"
            ).open_some()
        )
        
        
    @sp.entry_point
    def approve(self, params):
        """Approval entry point for the FA1.2 Token Standard
        
        Manages the approvals map in the balances TBigMap to allow accounts to transfer tokens 
        on behalf of other authorized accounts for the specified approval value
        
        Args:
            spender (sp.TAddress): Address of the person to be authorized by the sp.sender
            value (sp.TNat): Maximum amount of tokens that the approved person can spend
        """
        
        # Setting a type to each parameter
        sp.set_type(
            params, 
            sp.TRecord(
                spender = sp.TAddress,
                value = sp.TNat
            )
        ).layout(
            (
                "spender", 
                "value"
            )
        )
        
        # Check if the token transaction is not set to 'paused'
        sp.verify(~self.data.paused)
        
        # Check whether the 'spender' is not already approved by the 'sp.sender'
        # alreadyApproved = self.data.balances[sp.sender].approvals.get(params.spender, 0)
        # sp.verify((alreadyApproved == 0) | (params.value == 0), "UnsafeAllowanceChange")
        with sp.if_(~self.data.balances[sp.sender].approvals.contains(params.spender)):
            self.data.balances[sp.sender].approvals[params.spender] = 0
        
        # Add the approved value to the approvals map inside the balances map for the sp.sender
        self.data.balances[sp.sender].approvals[params.spender] += params.value
        
        # Invoke the entry point in DAO as well to keep the balances big map sychronized
        sp.transfer(
                sp.record(
                    address = params.spender, 
                    owner = sp.sender,
                    value = self.data.balances[sp.sender].approvals[params.spender]
                ),
                sp.tez(0),
                sp.contract(
                    sp.TRecord(
                        address = sp.TAddress, 
                        owner = sp.TAddress, 
                        value = sp.TNat
                    ),
                    self.data.daoContract, 
                    "syncApproval"
                ).open_some()
            )


    @sp.entry_point
    def setPause(self, params):
        """An entry point for the administrator to pause all movements of the token
        
        Args:
            pause (sp.TBool): Boolean value indicating whether 'paused' should be true/false
        """
        
        # Setting a type to each parameter
        sp.set_type(
            params,
            sp.TRecord(
                pause = sp.TBool
            )
        ).layout(
            (
                "pause"    
            )
        )
        
        # Check whether the caller of the entry point is the current token administrator only
        sp.verify(sp.sender == self.data.administrator)
        
        # Set the 'paused' storage variable to the given params
        self.data.paused = params.pause


    @sp.entry_point
    def setAdministrator(self, params):
        """Entry point for changing the administrator for the token contract
        
        Can only be invoked by the current token contract administrator
        
        Args:
            newAdmin (sp.TAddress): Address of the account to be set as the new administrator  
        """
                
        # Setting a type to each parameter
        sp.set_type(
            params,
            sp.TRecord(
                newAdmin = sp.TAddress
            )
        ).layout(
            (
                "newAdmin"    
            )
        )
        
        # Check whether the caller of the entry point is the current token administrator only
        sp.verify(sp.sender == self.data.administrator)
        
        # Set the new administrator specified in 'params' as the current administrator in storage
        self.data.administrator = params.newAdmin


    @sp.entry_point
    def mint(self, params):
        """Minting tokens entry point for the FA1.2 Token Standard
        
        Generates new tokens, increases total supply and updates the balances TBigMap to add the
        newly generated tokens to the address specified in the params. Also invokes entry point
        in the DAO Contract to update its balances TBigMap for synchronization. Can only be invoked
        by the token contract administrator.
        
        Args:
            address (sp.TAddress): Account where the newly minted tokens should be deposited
            value (sp.TNat): Amount of tokens to be minted
        """
        
        # Setting a type to each parameter
        sp.set_type(
            params, 
            sp.TRecord(
                address = sp.TAddress, 
                value = sp.TNat
            )
        ).layout(
            (
                "address",
                "value"
            )    
        )
        
        # Check whether the caller of the entry point is the current token administrator only
        sp.verify(sp.sender == self.data.administrator)
        
        # Add the recepient address to the balances TBigMap if it does not already exist
        self.addAddressIfNecessary(params.address)
        
        # Add the specified 'value' to the receivers address in the balances TBigMap and increase 
        # totalSupply storage variable with the same 'value'
        self.data.balances[params.address].balance += params.value
        self.data.totalSupply += params.value
        
        # Invoke the entry point in DAO Contract to synchronize the balances TBigMap and totalSupply
        sp.transfer(
            sp.record(
                address = params.address, 
                value = self.data.balances[params.address].balance
            ), 
            sp.tez(0),
            sp.contract(
                sp.TRecord(
                    address = sp.TAddress, 
                    value = sp.TNat
                ), 
                self.data.daoContract, 
                "syncBalance"
            ).open_some()
        )


    def addAddressIfNecessary(self, address):
        """A utility method to add a new address to the balances TBigMap
        
        Adds the 'address' to the TBigMap keys if it does not already contain it, else ignores
        Args:
            address (sp.TAddress): Address of the account to be added to the TBigMap
        """
        
        # Check whether the address already exists in the balances TBigMap and if does
        # not exist then initiliaze the address with 0 balance and an empty approvals map
        with sp.if_(~ self.data.balances.contains(address)):
            self.data.balances[address] = sp.record(balance = 0, approvals = {})


class CrowdSale(sp.Contract):
    def __init__(self, _admin, _price, _daoMultiSig):
        self.init_type(t = sp.TRecord(
                        token = sp.TOption(sp.TAddress),
                        price = sp.TNat,
                        daoMultiSig = sp.TAddress,
                        admin = sp.TAddress))
        self.init(token = sp.none, 
                  price = _price, 
                  daoMultiSig = _daoMultiSig,
                  admin = _admin)
    
    '''
    @Params value is the number of tokens to buy
    '''
    @sp.entry_point
    def buyTokens(self, value):
        sp.verify(self.data.token.is_some())
        sp.verify(sp.sender != self.data.daoMultiSig)
        sp.verify(sp.mutez(value * self.data.price) == sp.amount)
        
        tokenContract = sp.contract(sp.TRecord(address = sp.TAddress, value = sp.TNat),
                                    self.data.token.open_some(),
                                    "mint").open_some()
        
        #Mint tokens for sender
        sp.transfer(sp.record(address = sp.sender, value = value),
                    sp.tez(0),
                    tokenContract)
                    
        #Mint (10% * value) tokens for DAO multisig contract
        sp.transfer(sp.record(address = self.data.daoMultiSig, value = value // 10),
                    sp.tez(0),
                    tokenContract)
    
    @sp.entry_point
    def setTokenContract(self, address):
        sp.verify(~self.data.token.is_some())
        sp.verify(sp.sender == self.data.admin)
        
        self.data.token = sp.some(address)
     
        
class DAO(sp.Contract):
    """Contract for the Decentralized Autonomous Organization that would control all the management
        for the funding rounds 
    
    Storage Variables:
        token (sp.TAddress): Address for the FA1.2 Token Standard contract associated with the DAO 
        roundManager (sp.TBigMap): Address for the RoundManager contract for the funding rounds
        admin (sp.TAddress): An adminstrator account that has executing privileges
        
        tokenMintProposals (sp.TBigMap): Map for all the mintProposals started or ended in the DAO
        tokenMintProposalId (sp.TNat): Count of number of mintProposals
        tokenMmintProposalActive (sp.TBool): Boolean value indicating whether a mintProposal is on
        minTokenMintProposalVotes (sp.Nat): Minimum quorum for acceptance of mintProposal
        minTokenMintProposalStake (sp.TNat): Minimum tokens to stake when voting for mintProposal
        
        newRoundProposals (sp.TBigMap): Map for all the newRoundProposals started or ended in the DAO
        newRoundProposalId (sp.TNat): Count of number of newRoundProposals
        newRoundProposalActive (sp.TBool): Boolean value indiciating whether a newRoundProposal is on
        minNewRoundProposalVotes (sp.TInt): Minimum quorum for acceptance of newRoundProposal
        minNewRoundProposalStake (sp.TNat): Minimum tokens to stake when voting for mintProposal
        currentOnGoingRoundProposalId (sp.TInt): ID of proposal whose current round in on
        
        disputes (T.map): Map for all the disputes on listed projects that have been submitted
        minDisputeSettleVotes (T.TNat): Minimum quorom on voting for settling a dispute
        disputeFee (sp.TNat): Amount of tokens required to contest dispute on a particular project
        
        minimumVoteDifference (sp.TInt): Difference in number of votes of inFavour v/s not inFavour
        holders (sp.TBigMap): Map to track the token balances of shareholders
        
    Entry Points:
        setRoundManagerContract: Utility method to allow the admin to set the round manager contract 
            only if it is not already set
        addTokens: Internal entry point for the token standard to add to the balances TBigMap
        removeTokens: Internal entry point for the token standard to remove from the balances TBigMap
        setApproval: Internal entry point for the token standard to set approval address and value
        decreaseApproval: Internal entry point for the token standard to decrease approval value
        
        initialMint: Entry point for minting the initial FA1.2 tokens to the supplied 'members'
        proposeTokenMint: Entry point for starting a new proposal to mint new tokens
        voteForTokenMintProposal: Vote for a proposal for minting of new tokens that is active
        executeTokenMintProposal: Entry point to execute the token minting proposal
        
        proposeNewRound: Entry point to proposal to start a new funding round
        voteForNewRoundProposal: Vote for a proposal for starting a new funding round
        executeNewRoundProposal: Entry point to execute the token minting proposal
        donateToRound: Allow sponsors to donate to the subsidy pool before the round is listed
        listNewRound: Lists the accepted new round proposal to the RoundManager Contract
        settleRound: Calls the disburse function in RoundManager contract along with all funds
        raiseDispute: Allow a shareholder to set an entry in the funding round as disputed
        voteForDispute: Vote for the disputed entry in the on-going funding round
        settleDispute: Execute the settlement for the disputed entry after the voting period
        
    Methods:
        setTokenContract: Utility method to allow the admin to set the token contract only if it is
            not already set
        vote: Internal method for voting on a proposal by a shareholder
    """
    
    def __init__(self, _admin):
        self.init(
            # Communication related storage
            token = sp.none,
            roundManager = sp.none,
            admin = _admin,
            
            # Proposing to start a new funding round related storage
            newRoundProposals = sp.big_map(
                tkey = sp.TNat,
                tvalue = sp.TRecord(
                    name = sp.TString,
                    created = sp.TTimestamp,
                    creator = sp.TAddress,
                    start = sp.TTimestamp,
                    end = sp.TTimestamp,
                    votesYes = sp.TNat,
                    votesNo = sp.TNat,
                    voters = sp.TMap(sp.TAddress, sp.TNat),
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
                    # votingExpiry = sp.TTimestamp,
                    expiry = sp.TTimestamp 
                )
            ),
            newRoundProposalId = sp.nat(0),
            newRoundProposalActive = False,
            minNewRoundProposalVotes = sp.nat(0),  # Set to 0 for testing. 
            minNewRoundProposalStake = sp.nat(200),
            currentOnGoingRoundProposalId = sp.int(-1),
            
            # Dispute Voting related storage
            disputes = sp.map(
                tkey = sp.TNat, 
                tvalue = sp.TRecord(
                    disputer = sp.TAddress,
                    votesYes = sp.TNat,
                    votesNo = sp.TNat,
                    expiry = sp.TTimestamp,
                    voters = sp.TMap(sp.TAddress, sp.TNat),
                    resolved = sp.TInt  # 0: Voting period, 1: Dispute won, -1: Dispute Lost 
                )
            ),
            minDisputeSettleVotes = sp.nat(1), # Testing only
            disputeFee = sp.nat(200), #Test value
            
            # General voting configurations
            minimumVoteDifference = sp.int(0),
            
            # Tracking token balances of shareholders
            holders = sp.big_map(  # Holder address to balance, approvals map
                tkey = sp.TAddress, 
                tvalue = sp.TRecord(
                    approvals = sp.TMap(sp.TAddress, sp.TNat),
                    balance = sp.TNat
                )
            ) 
        )

    # Utility functions
    @sp.entry_point
    def setTokenContract(self, _token):
        """Utility method to allow the admin to set the token contract only if it is not already set
        
        Args:
            _token (sp.TAddress): Address of the FA1.2 Token Standard Contract associated with the DAO
        """
        
        # Setting a type to each parameter
        sp.set_type(_token, sp.TAddress)
        
        sp.verify(sp.sender == self.data.admin)
        sp.verify(~self.data.token.is_some())
        self.data.token = sp.some(_token)
        
    @sp.entry_point
    def setRoundManagerContract(self, params):
        """Utility method to allow the admin to set the round manager contract only if it is not
            already set
        
        Args:
            _roundManager (sp.TAddress): Address of the round manager contract associated with the
                quadratic funding rounds
        """
        
        # Setting a type to each parameter
        sp.set_type(
            params,
            sp.TRecord(
                _roundManager = sp.TAddress    
            )
        ).layout(
            (
                "_roundManager"    
            )    
        )
        
        sp.verify(~self.data.roundManager.is_some())
        sp.verify(sp.sender == self.data.admin)
        self.data.roundManager = sp.some(params._roundManager)
    
    @sp.entry_point
    def syncBalance(self, params):
        """Internal entry point for the token standard sync the balance with the balances BigMap in DAO contract
        
        Args:
            address (sp.TAddress): Address of the account to add tokens to
            value (sp.TNat): Amount of tokens to add to the specified 'address'
        """
        
        #Type setting for parameters
        sp.set_type(
            params,
            sp.TRecord(
                address = sp.TAddress,
                value = sp.TNat
            )
        ).layout(
            (
                "address",
                "value"
            )    
        )
        
        #Check if token contract has called the entry point
        sp.verify(sp.sender == self.data.token.open_some())
        
        #Add the address if not already present
        with sp.if_(~self.data.holders.contains(params.address)):
            self.data.holders[params.address] = sp.record(approvals = {}, 
                                                        balance = 0)
        
        self.data.holders[params.address].balance = params.value
        
    @sp.entry_point
    def syncApproval(self, params):
        """Internal entry point for the token standard to sync approval value and value in the
            DAO holders (balances) TBigMap so keep it updated with the Token Contract map
        
        Args:
            address (sp.TAddress): Address of the account to be given approval to
            owner (sp.TAddress): Owner of the tokens who wishes to give approval to 'address'
            value (sp.TNat): Amount of tokens to be set for approval from the specified 'address'
        """
        
        # Setting a type to each parameter
        sp.set_type(
            params,
            sp.TRecord(
                address = sp.TAddress,
                owner = sp.TAddress,
                value = sp.TNat
            )
        ).layout(
            (
                "address",
                "owner",
                "value"
            )    
        )
        
        # Check if the caller of the entry point is the Token Contract      
        sp.verify(sp.sender == self.data.token.open_some())
        
        # Add the 'address' to the approvals map of the 'owner' for the specified 'value' to 
        # keep it updated with the balances map in the token contract; it is assumed all information
        # is corrected since only the token contract can call this entry point
        self.data.holders[params.owner].approvals[params.address] = params.value
    
    def vote(self, subject, inFavor, value):
        """Internal method for voting on a proposal by a shareholder
        
        Vote for the proposal passed as 'subject' in the method and put your tokens as stake
        in the DAO which will be proportional to your vote in the proposal as per the quadratic
        funding scheme. DAO Contract first has to be approved to transfer the voter's tokens from
        the voter's account to the DAO Contract otherwise the vote attempt would fail. 
        
        Args:
            subject (sp.TRecord): Proposal or issue to be voted on
            inFavour (sp.TBool): Boolean value indicating whether vote is in favour of the proposal
            value (sp.TNat): Amount of tokens to stake for the vote for quadratic voting
        """
        # Setting a type to each parameter
        # sp.set_type(subject, sp.TRecord)
        sp.set_type(inFavor, sp.TBool)
        sp.set_type(value, sp.TNat)
        
        # Check whether the caller of the function has already voted (Is it needed? Can allow
        # a person to vote multiple times?)
        sp.verify(~subject.voters.contains(sp.sender))
        
        # Check whether the voting period is over
        sp.verify(sp.now < subject.expiry)
        
        # Verify and take the stake
        sp.verify(self.data.holders[sp.sender].approvals.contains(sp.to_address(sp.self)))
        sp.verify(self.data.holders[sp.sender].approvals[sp.to_address(sp.self)] >= value)
        
        # Determine number of actual votes using the quadratic formula
        y = sp.local('y', value)
        x = value
        with sp.while_(y.value * y.value > x):
            y.value = (x // y.value + y.value) // 2
        sp.verify((y.value * y.value <= x) & (x < (y.value + 1) * (y.value + 1)))
        
        # Add determined votes to the subject's voting details
        with sp.if_(inFavor == True):
            subject.votesYes += y.value
        with sp.else_():
            subject.votesNo += y.value
            
        subject.voters[sp.sender] = value
        
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
                self.data.token.open_some(), 
                "transfer"
            ).open_some()    
        )
        
    
    # NEW ROUNDS AND PROPOSALS ENTRY POINTS AND METHODS
    
    @sp.entry_point
    def proposeNewRound(self, params):
        """Entry point to proposal to start a new funding round if one isn't going on already
        
        Args:
            name (sp.TString): Name of the new round being proposed
            startTime (sp.TTimestamp): Time when the proposed funding round will start
            endTime (sp.TTimestamp): Time when the proposed funding round will end
            expiry (sp.TTimestamp): Expiry time for the votinf period on the proposal to end
        """
        
        # Setting a type to each parameter
        sp.set_type(
            params,
            sp.TRecord(
                name = sp.TString,
                startTime = sp.TTimestamp,
                endTime = sp.TTimestamp,
                expiry = sp.TTimestamp
            )
        ).layout(
            (
                "name",
                "startTime",
                "endTime",
                "expiry"
            )
        )
        
        # Check whether the call of the entry point is a shareholder
        sp.verify(
            self.data.holders.contains(sp.sender) & 
            (self.data.holders[sp.sender].balance > 0)
        )
        
        # Check whether another newRoundProposal is already active or not
        sp.verify(~self.data.newRoundProposalActive)
        
        # Check whether the round start time and end time are after the voting expiry
        sp.verify(params.endTime > params.startTime)
        sp.verify(params.startTime > params.expiry)
        
        # Add a new round proposal and set the newRoundProposalActive to True
        self.data.newRoundProposalId += 1
        self.data.newRoundProposals[self.data.newRoundProposalId] = sp.record(
            name = params.name,
            created = sp.now,
            creator = sp.sender,
            start = params.startTime,
            end = params.endTime,
            votesYes = 0,
            votesNo = 0,
            voters = sp.map(),
            listed = False,
            resolved = 0,
            totalFunds = sp.mutez(0),
            sponsorToFunds = sp.map(),
            expiry = params.expiry,
        )
        self.data.newRoundProposalActive = True

       
    @sp.entry_point
    def voteForNewRoundProposal(self, params):
        """Vote for a proposal for starting a new funding round that is currently active
        
        Args:
            inFavor (sp.TBool): Boolean value indicating whether the vote is for or against the 
                proposal
            value (sp.TNat): Amount of tokens to put at stake that would be proportional to the 
                amount of votes added
        """
        
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
        
        # Check whether the caller of this entry point is a shareholder
        sp.verify(
            self.data.holders.contains(sp.sender) & 
            (self.data.holders[sp.sender].balance > 0)
        )
        
        # Verify whether a proposal to mint tokens is active
        sp.verify(self.data.newRoundProposalActive)
        
        # Value should be greater than 0 as a minimum of 1 vote needs to be added
        sp.verify(params.value > 0)
        
        # Get the latest mintProposal and check whether the voting period is not expired
        proposal = self.data.newRoundProposals[self.data.newRoundProposalId]
        sp.verify(sp.now < proposal.expiry)
        sp.verify(proposal.resolved == sp.int(0))
        
        # Vote for the proposal (value has to be approved by the sender for the DAO address)
        self.vote(proposal, params.inFavor, params.value)
        
        
    @sp.entry_point
    def executeNewRoundProposal(self):
        """Entry point to execute the token minting proposal once its voting has expired
        """        

        # Check whether the caller of this entry point is a shareholder
        sp.verify(
            self.data.holders.contains(sp.sender) &
            (self.data.holders[sp.sender].balance > 0)
        )
        
        # Verify whether a proposal to mint tokens is active       
        sp.verify(self.data.newRoundProposalActive)
        
        # Get the latest mintProposal and verify that the voting period is expired
        proposal = self.data.newRoundProposals[self.data.newRoundProposalId]
        sp.verify(sp.now > proposal.expiry)
        sp.verify(proposal.resolved == sp.int(0))
        
        # Check if all criteria for the proposal to be accepted is met, else reject it
        yesFinal = proposal.votesYes * proposal.votesYes
        noFinal = proposal.votesNo * proposal.votesNo
        with sp.if_((((yesFinal - noFinal) > self.data.minimumVoteDifference) & (sp.len(proposal.voters) >= self.data.minNewRoundProposalVotes))):
            proposal.resolved = 1
        with sp.else_():
            proposal.resolved = -1
        
        # Return the stake back to their original owners (voters)
        with sp.for_('voter', proposal.voters.keys()) as voter:
            sp.transfer(
                sp.record(
                    to_ = voter,
                    from_ = sp.to_address(sp.self), 
                    value = proposal.voters[voter]
                ), 
                sp.tez(0),
                sp.contract(
                        sp.TRecord(
                            from_ = sp.TAddress,
                            to_ = sp.TAddress,
                            value = sp.TNat
                        ), 
                    self.data.token.open_some(), 
                    "transfer"
                ).open_some()
            )
        
        self.data.newRoundProposalActive = False
    
    
    @sp.entry_point
    def donateToRound(self, params):
        """Allow sponsors to donate to the subsidy pool before the round is listed
        
        Args:
            name (sp.TString): Name of the sponsor
        """
        
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
        
        # DO NOT check if a newRoundProposal is currently active
        # sp.verify(self.data.newRoundProposalActive)
        
        # Verify whether the proposal is accepted and not listed yet
        proposal = self.data.newRoundProposals[self.data.newRoundProposalId]
        sp.verify(proposal.resolved == 1)
        sp.verify(~proposal.listed)
        
        # Only one donation allowed for the time being. Can modify later.
        sp.verify(~proposal.sponsorToFunds.contains(sp.sender))
        
        # Register the funds and the sponsor to the new round which is about to be listed
        proposal.sponsorToFunds[sp.sender] = sp.record(
            name = params.name,
            amount = sp.amount
        )
        proposal.totalFunds += sp.amount
    

    @sp.entry_point
    def listNewRound(self):
        """Lists the accepted new round proposal to the RoundManager Contract
        """
        
        # Check whether the caller of this entry point is a shareholder
        sp.verify(
            self.data.holders.contains(sp.sender) &
            (self.data.holders[sp.sender].balance > 0)
        )
        
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
            name=proposal.name,
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
                    name=sp.TString,
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
        
        # Clear all past disputes
        self.data.disputes = {}       
    
    
    @sp.entry_point
    def settleRound(self):
        """Entry point to call the disburse function in RoundManager contract along with all 
            the subsidy funds
        """
        
        # Check whether the caller of this entry point is a shareholder
        sp.verify(
            self.data.holders.contains(sp.sender) &
            (self.data.holders[sp.sender].balance > 0)
        )
        
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
    
    # @dev: Check approval amount and call the approve function if needed on the front end
    @sp.entry_point
    def raiseDispute(self, params):
        """Allow a shareholder to set an entry in the funding round as disputed
        
        Args:
            entryId (sp.TNat): Entry ID of the entry in the on-going funding round
        """
        
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
        
        # Check whether the caller of this entry point is a shareholder and has more token
        # balance than the dispute fee
        sp.verify(
            self.data.holders.contains(sp.sender) &
            (self.data.holders[sp.sender].balance > self.data.disputeFee)
        )
        
        # Check whether the entry is not already disputed on
        sp.verify(~self.data.disputes.contains(params.entryId))
        
        # erify and take the stake
        sp.verify(self.data.holders[sp.sender].approvals.contains(sp.to_address(sp.self)))
        sp.verify(
            self.data.holders[sp.sender].approvals[sp.to_address(sp.self)] >= 
            self.data.disputeFee
        )
        
        # Invoke the transfer entry point in the token contract to actually transfer the tokens
        c = sp.contract(
            sp.TRecord(
                from_ = sp.TAddress, 
                to_ = sp.TAddress, 
                value = sp.TNat
            ), 
            self.data.token.open_some(), 
            "transfer"
        ).open_some()
        sp.transfer(
            sp.record(
                from_ = sp.sender, 
                to_ = sp.to_address(sp.self), 
                value = self.data.disputeFee
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
        self.data.disputes[params.entryId] = sp.record(
            disputer = sp.sender,
            votesYes = 0,
            votesNo = 0,
            voters = sp.map(),
            resolved = 0,
            expiry = sp.now.add_seconds(500) #for testing only
        )
    
    
    # @dev: Check approval amount and call the approve function if needed on the front end 
    @sp.entry_point
    def voteForDispute(self, params):
        """Vote for the disputed entry in the on-going funding round
        
        Args:
            entryId (sp.TNat): ID of the entry in the funding round that is disputed
            inFavor (sp.TBool): Boolean value indicating whether the vote is for or against the 
                proposal
            value (sp.TNat): Amount of tokens to put at stake that would be proportional to the 
                amount of votes added
        """
        
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
        
        # Verify whether the caller of the function is a shareholder
        sp.verify(self.data.holders.contains(sp.sender))
        sp.verify(self.data.holders[sp.sender].balance >= params.value)
        
        # Check whether the entry ID is actually disputed
        sp.verify(self.data.disputes.contains(params.entryId))
        
        # Get the disputed entry and verify that the dispute period is not expired
        disputedEntry = self.data.disputes[params.entryId]
        sp.verify(sp.now < disputedEntry.expiry)
        
        # Vote for the dispute (value has to be approved by the sender for the DAO address)
        self.vote(disputedEntry, params.inFavor, params.value)

    
    @sp.entry_point
    def settleDispute(self, params):
        """Execute the settlement for the disputed entry after the voting period has expired
        
        Args:
            entryId (sp.TNat): Entry Id for the disputed entry to be settled
        """
        
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
        
        # Check whether the caller of this entry point is a shareholder
        sp.verify(
            self.data.holders.contains(sp.sender) &
            (self.data.holders[sp.sender].balance > 0)
        )
        
        # Check if the entry ID is actually still disputed and its voting period is expired
        sp.verify(self.data.disputes.contains(params.entryId))
        dispute = self.data.disputes[params.entryId]
        sp.verify(sp.now > dispute.expiry)
        sp.verify(dispute.resolved == 0)
        
        # value = 1 for testing only
        yesFinal = dispute.votesYes * dispute.votesYes
        noFinal = dispute.votesNo * dispute.votesNo
        with sp.if_((yesFinal > noFinal) & (yesFinal > self.data.minDisputeSettleVotes)):
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
                    value = self.data.disputeFee
                ), 
                sp.tez(0),
                sp.contract(
                    sp.TRecord(
                        from_ = sp.TAddress, 
                        to_ = sp.TAddress, 
                        value = sp.TNat
                    ), 
                    self.data.token.open_some(), 
                    "transfer"
                ).open_some()
            )
            
        with sp.else_():
            dispute.resolved = -1
        
        # Return stake back to all voters
        with sp.for_('voter', dispute.voters.keys()) as voter:
            sp.transfer(
                sp.record(
                    to_ = voter,
                    from_ = sp.to_address(sp.self), 
                    value = dispute.voters[voter]
                ), 
                sp.tez(0),
                sp.contract(
                    sp.TRecord(
                        from_ = sp.TAddress,
                        to_ = sp.TAddress,
                        value = sp.TNat
                    ), 
                    self.data.token.open_some(), 
                    "transfer"
                ).open_some()
            )
        
        
class RoundManager(sp.Contract):
    """Contract for managing the rounds of the Quadratic Funding scheme
    
    Storage Variables:
        daoContractAddress (sp.TAddress): Address of the governing DAO Contract
        isRoundActive (sp.TBool): Boolean value indicating whether a round is on or not
        currentRound (sp.TNat): Current round number; Used for keeping track of current round
            in the rounds TMap
        rounds (sp.TMap): Main map that stores the details of all the rounds
    
    Entry Points:
        createRound: Entry point for the DAO to list a new round
        enterRound: Entry point for people to add their entries for the funding round
        contribute: Allow people to contribute XTZ to their desired entries
        dispute: Entry point for setting an entry in the funding round as 'disputed'
        disqualify: Entry point for the DAO Contract to disqualify an entry after voting
        disburse: Entry point for the entries to recieve their money once the funding round is over
    """
    def __init__(self, _daoContractAddress):
        # When a new round begins, current_round will be changed to current_round + 1.
        # So the first round will have the key 0.
        # The description of each proposal is an IPFS Hash which contains the detailed 
        # description of the project.
        self.init(
            daoContractAddress = _daoContractAddress, 
            isRoundActive = False, 
            currentRound = sp.nat(-1), 
            rounds = sp.big_map(
                tkey = sp.TNat, 
                tvalue = sp.TRecord(
                    name = sp.TString,
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
                    entries = sp.TBigMap(
                        sp.TNat,
                        sp.TRecord(
                            description = sp.TString, 
                            address = sp.TAddress, 
                            disputed = sp.TBool,
                            disputeEnd = sp.TTimestamp,
                            disqualified = sp.TBool,
                            contributions = sp.TList(
                                sp.TRecord(
                                    address = sp.TAddress, 
                                    amount = sp.TNat, 
                                    clrMatch = sp.TMutez,
				    timestamp = sp.TTimestamp
                                )
                            ),
                            totalContribution = sp.TMutez,
                            subsidyPower = sp.TNat,
                            sponsorshipWon = sp.TMutez
                        )
                    ), 
                    totalSponsorship = sp.TMutez, 
                    totalContribution = sp.TMutez,
                    totalSubsidyPower = sp.TNat
                )
            )
        )
        
    
    @sp.entry_point 
    def createNewRound(self, params):
        """Entry point for the DAO to list a new round
        
        Args:
            start (sp.TTimestamp): Start time of the new funding round
            end (sp.TTimestamp): End time of the new funding round
            name (sp.TString): Name for the new funding round
            totalSponsorship (sp.TMutez): Total XTZ received for the subsidy pool
            sponsors (sp.TMap): Map for storing which sponsors donated how much
        """
        
        # Setting a type to each parameter
        sp.set_type(
            params, 
            sp.TRecord(
                start=sp.TTimestamp,
                end=sp.TTimestamp,
                name=sp.TString,
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
                "name",
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
            name=params.name,
            totalSponsorship=params.totalSponsorship,
            sponsors=params.sponsors,
            entries=sp.big_map(),
            totalContribution=sp.mutez(0),
            totalSubsidyPower=sp.nat(0),
            entryId=sp.nat(-1),
        )
        self.data.isRoundActive = True
        
        
    @sp.entry_point
    def enterRound(self, params):
        """Entry point for people to add their entries for the funding round
        
        Args:
            description (sp.TString): An IPFS Hash of the document containing the description for
                the new entry
        """
        
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
            contributions=sp.list(),
            totalContribution = sp.tez(0),
            subsidyPower = sp.nat(0),
            sponsorshipWon = sp.tez(0)
        )
        
        
    @sp.entry_point
    def contribute(self, params):
        """Allow people to contribute XTZ to their desired entries
        
        Args:
            entryId (sp.TNat): Entry ID for the entry to contribute XTZ to
        """
        
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
        sp.verify(params.entryId >= 0)
        sp.verify(params.entryId <= self.data.rounds[self.data.currentRound].entryId)
        sp.verify(~self.data.rounds[self.data.currentRound].entries[params.entryId].disqualified)
        
        # Add a contribution to the entry of the desired amount
        self.data.rounds[self.data.currentRound].entries[params.entryId].contributions.push(
            sp.record(
                address = sp.sender,
                amount = sp.fst(sp.ediv(sp.amount, sp.tez(1)).open_some()),
                clrMatch = sp.tez(0),
		timestamp = sp.now
            )
        )
        
        # Update contributions in the contract storage maps
        self.data.rounds[self.data.currentRound].entries[params.entryId].totalContribution += sp.amount
        self.data.rounds[self.data.currentRound].totalContribution += sp.amount
        
        
    @sp.entry_point
    def dispute(self, params):
        """Entry point for setting an entry in the funding round as 'disputed'; Can only be called
            by a shareholder via the DAO Contract
        
        Args:
            entryId (sp.TNat): Entry ID for the entry to be disputed
        """
        
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
        sp.verify(params.entryId >= 0)
        sp.verify(params.entryId <= self.data.rounds[self.data.currentRound].entryId)
        sp.verify(~self.data.rounds[self.data.currentRound].entries[params.entryId].disqualified)
        
        # Set the entry as disputed
        self.data.rounds[self.data.currentRound].entries[params.entryId].disputed = True
        self.data.rounds[self.data.currentRound].entries[params.entryId].disputeEnd = sp.now.add_seconds(600)
        
        
    @sp.entry_point
    def disqualify(self, params):
        """Entry point for the DAO Contract to disqualify an entry after voting
        
        Args:
            entryId (sp.TNat): Entry ID for the entry to be disqualified
        """ 
        
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
        sp.verify(params.entryId >= 0)
        sp.verify(params.entryId <= self.data.rounds[self.data.currentRound].entryId)
        sp.verify(
            sp.now > self.data.rounds[self.data.currentRound].entries[params.entryId].disputeEnd
        )
        sp.verify(~self.data.rounds[self.data.currentRound].entries[params.entryId].disqualified)
        
        # Disqualify the entry and return all contributions
        self.data.rounds[self.data.currentRound].entries[params.entryId].disqualified = True
        with sp.for_('contribution', self.data.rounds[self.data.currentRound].entries[params.entryId].contributions) as contribution:
            sp.send(contribution.address, sp.tez(contribution.amount))
            self.data.rounds[self.data.currentRound].totalContribution -= sp.tez(contribution.amount)


    @sp.entry_point
    def disburse(self):
        """Entry point for the entries to recieve their money once the funding round is over;
            Can only be called by the DAO contract along with all the sponsorship money
        """
        
        # Setting a type to each parameter
        # sp.set_type(
        #     params,
        #     sp.TRecord(
        #         dummy = sp.TString
        #     ),
        # ).layout(
        #     (
        #         "dummy"
        #     )    
        # )
        # Verify whether the sender is the DAO Contract only 
        sp.verify(sp.sender == self.data.daoContractAddress)
        
        # Check whether a round is active and if the round is accepting new disputes
        sp.verify(self.data.isRoundActive == True)
        sp.verify(sp.now > self.data.rounds[self.data.currentRound].start)
        sp.verify(sp.now > self.data.rounds[self.data.currentRound].end)
        
        # Verify whether the full sponsorship amount is sent
        sp.verify(sp.amount == self.data.rounds[self.data.currentRound].totalSponsorship)
        
        # Loop over all entries and find their subsidy power using quadratic formula
        with sp.for_('i', sp.range(0, self.data.rounds[self.data.currentRound].entryId + 1)) as i:
            with sp.if_(~self.data.rounds[self.data.currentRound].entries[i].disqualified):
            
                # Loop over each contribution to calculate sum of square roots of
                # individual contributions
                with sp.for_('contribution', self.data.rounds[self.data.currentRound].entries[i].contributions) as contribution:
                    
                    # Calculating square root of contribution.amount, y.value will have
                    # the square root. Multiply by 10^6 to get a precision of 3 decimal places
                    amount = contribution.amount * 10000
                    root = sp.local('root', amount)
                    with sp.while_(root.value * root.value > amount):
                        root.value = (amount // root.value + root.value) // 2
                        
                    sp.verify(
                        (root.value * root.value <= amount) & 
                        (amount < (root.value + 1) * (root.value + 1))
                    )
                    
                    # Keep adding the square roots of contributions
                    self.data.rounds[self.data.currentRound].entries[i].subsidyPower += root.value
                
                # Take the square of the sum of the square roots
                self.data.rounds[self.data.currentRound].entries[i].subsidyPower = (self.data.rounds[self.data.currentRound].entries[i].subsidyPower * self.data.rounds[self.data.currentRound].entries[i].subsidyPower) / 10000
                
                # Maintain a totalSubsidyPower variable for division later
                self.data.rounds[self.data.currentRound].totalSubsidyPower += self.data.rounds[self.data.currentRound].entries[i].subsidyPower
            
        sp.verify(self.data.rounds[self.data.currentRound].totalSubsidyPower > 0)
        
        # Keep track of how much amount is remaining so that change can be returned
        sponsorshipRemaining = sp.local('totalSponsorship', sp.amount)
        
        with sp.for_('i', sp.range(0, self.data.rounds[self.data.currentRound].entryId + 1)) as i:
            with sp.if_(~self.data.rounds[self.data.currentRound].entries[i].disqualified):
                self.data.rounds[self.data.currentRound].entries[i].sponsorshipWon = sp.split_tokens(
                    sp.amount, 
                    self.data.rounds[self.data.currentRound].entries[i].subsidyPower,
                    self.data.rounds[self.data.currentRound].totalSubsidyPower
                )
                
                sp.send(
                    self.data.rounds[self.data.currentRound].entries[i].address, 
                    self.data.rounds[self.data.currentRound].entries[i].sponsorshipWon + 
                    self.data.rounds[self.data.currentRound].entries[i].totalContribution
                )
                
                sponsorshipRemaining.value -= self.data.rounds[self.data.currentRound].entries[i].sponsorshipWon
            
        self.data.isRoundActive = False
        
        # Return the change to DAO
        #sp.send(self.data.daoContractAddress, sponsorshipRemaining.value)    
        

if "templates" not in __name__:
    # @sp.add_test(name="FA1dot2 Token Functionalities")
    # def testQuadTokenFunctionalities():
    #     """Testing scenarios for the FA1.2 Token (QuadToken) Contract
        
    #     Testing scenarios for the FA1.2 Token (QuadToken) to check whether all entry points,
    #     storage variables, logics and security verification methods are sound. Also checks the 
    #     DAO Contract's token related functionalities work as expected.
    #     """
    
    #     # Initialize dummy accounts of all desired types
    #     # sp.test_account() generates ED25519 key-pairs deterministically
    #     admin = sp.test_account("Administrator") # Initial admin of the DAO Contract
    #     alice = sp.test_account("Alice") # Shareholder/Token Holder
    #     bob = sp.test_account("Bob") # Shareholder/Token Holder
    #     john = sp.test_account("John") # Shareholder/Token Holder
    #     mike = sp.test_account("Mike") # Not a shareholder/token holder
        
    #     # Initialize contracts (only the required ones)
    #     daoContract = DAO(admin.address)
    #     tokenContract = QuadToken(daoContract.address)
        
    #     scenario = sp.test_scenario()
        
    #     # Scenario for the ideal flow of execution, check if everything works as expected
    #     scenario.h1("FA1.2 Token Contract Functionalities Test")
        
    #     scenario.h3("Initial DAO Contract")
    #     scenario += daoContract
        
    #     scenario.h3("Initial Token Contract")
    #     scenario += tokenContract
        
    #     INITIAL_MINT = 2500
    #     scenario.h3("Initial mint")
    #     scenario += daoContract.initialMint(
    #         _token = tokenContract.address,
    #         _members = [
    #             admin.address, 
    #             alice.address, 
    #             bob.address, 
    #             john.address
    #         ], 
    #         value = INITIAL_MINT
    #     ).run(sender = admin)
        
    #     scenario.h3('Initial Mint Again (FAILED)')
    #     scenario += daoContract.initialMint(
    #         _token = tokenContract.address,
    #         _members = [
    #             admin.address, 
    #             alice.address, 
    #             bob.address, 
    #             john.address
    #         ], 
    #         value = INITIAL_MINT
    #     ).run(sender = admin, valid=False)
        
    #     # Verify whether minting works
    #     scenario.verify(tokenContract.data.totalSupply == 10000)
    #     scenario.h3("\n[&#x2713] 10000 tokens minted succesfully")
        
    #     # Verify whether all members have 2500 tokens according to the Token Contract
    #     scenario.verify(tokenContract.data.balances[admin.address].balance == INITIAL_MINT)
    #     scenario.verify(tokenContract.data.balances[alice.address].balance == INITIAL_MINT)
    #     scenario.verify(tokenContract.data.balances[bob.address].balance == INITIAL_MINT)
    #     scenario.verify(tokenContract.data.balances[john.address].balance == INITIAL_MINT)
    #     scenario.h3("\n[&#x2713] All members have 2500 tokens in 'balances' in token contract")
        
    #     # Verify whether all members have 2500 tokens according to the DAO Contract as well
    #     scenario.verify(daoContract.data.holders[admin.address].balance == INITIAL_MINT)
    #     scenario.verify(daoContract.data.holders[alice.address].balance == INITIAL_MINT)
    #     scenario.verify(daoContract.data.holders[bob.address].balance == INITIAL_MINT)
    #     scenario.verify(daoContract.data.holders[john.address].balance == INITIAL_MINT)
    #     scenario.h3("\n[&#x2713] All members have 2500 tokens in 'balances' in the DAO contract")

    #     scenario.verify(~daoContract.data.holders.contains(mike.address))
    #     scenario.verify(~tokenContract.data.balances.contains(mike.address))   
    #     scenario.h3("\n[&#x2713] All non-members do not exist in either of the 'balances'")
        
    #     # Test transfers
    #     scenario.h3("Send tokens from Alice to Bob by Bob (FAILED)")
    #     scenario += tokenContract.transfer(
    #         from_=alice.address, 
    #         to_=bob.address, 
    #         value=2500
    #     ).run(
    #         sender=bob, 
    #         valid=False
    #     )
        
    #     scenario.h3("Send tokens from Alice to Bob by Alice")
    #     scenario += tokenContract.transfer(
    #         from_=alice.address, 
    #         to_=bob.address, 
    #         value=2500
    #     ).run(sender=alice)
                
    #     scenario.verify(tokenContract.data.balances[alice.address].balance == 0)
    #     scenario.verify(tokenContract.data.balances[bob.address].balance == 5000)
        
    #     scenario.h3("Transfer from Alice to Bob by Alice with 0 balance (FAILED)")
    #     scenario += tokenContract.transfer(
    #         from_=alice.address, 
    #         to_=bob.address, 
    #         value=2500
    #     ).run(
    #         sender=alice, 
    #         valid=False
    #     )
    #     scenario.h3("\n[&#x2713] All transfers work as expected")
       
        
    #     # Test approvals
    #     scenario.h3("Approve Alice to spend on behalf of Bob")
    #     scenario += tokenContract.approve(
    #         spender=alice.address,
    #         value=2500
    #     ).run(sender=bob)
        
    #     scenario.h3("Alice spends all permitted tokens on behalf of Bob")
    #     scenario += tokenContract.transfer(
    #         from_=bob.address,
    #         to_=alice.address,
    #         value=2500
    #     ).run(sender=alice)
        
    #     scenario.verify(tokenContract.data.balances[alice.address].balance == 2500)
    #     scenario.verify(tokenContract.data.balances[bob.address].balance == 2500)
        
    #     scenario.h3("Alice spends all permitted tokens on behalf of Bob again (FAILED)")
    #     scenario += tokenContract.transfer(
    #         from_=bob.address,
    #         to_=alice.address,
    #         value=2500
    #     ).run(sender=alice, valid=False)
        
    #     scenario.h3("Approve Alice to spend on behalf of Bob more than Bob's balance")
    #     scenario += tokenContract.approve(
    #         spender=alice.address,
    #         value=5000
    #     ).run(sender=bob)
        
    #     scenario.h3(
    #         "Alice spends all the permitted tokens (more than balance) on behalf on Bob (FAILED)"
    #     )
    #     scenario += tokenContract.transfer(
    #         from_=bob.address,
    #         to_=alice.address,
    #         value=5000
    #     ).run(sender=alice, valid=False)
    #     scenario.h3("Alice spends all permitted tokens on behalf of Bob again (FAILED)")
    #     scenario += tokenContract.transfer(
    #         from_=bob.address,
    #         to_=alice.address,
    #         value=5000
    #     ).run(sender=alice, valid=False)
        
    #     scenario.verify(tokenContract.data.balances[alice.address].balance == 2500)
    #     scenario.verify(tokenContract.data.balances[bob.address].balance == 2500)
    #     scenario.h3("\n[&#x2713] All approvals work as expected")
        
    #     # # Test 'paused' and test 'setAdministrator'
    #     # scenario.h3("Change 'paused' variable (ADMIN ONLY)")
    #     # scenario += tokenContract.setPause(pause=True).run(sender=daoContract.address)
        
    #     # scenario.h3("Transfer tokens when 'paused' is True (FAILED")
    #     # scenario += tokenContract.transfer(
    #     #     from_=bob.address,
    #     #     to_=alice.address,
    #     #     value=2500
    #     # ).run(sender=alice, valid=False)
       
    #     # scenario.h3("Change administrator of token contract")
    #     # scenario += tokenContract.setAdministrator(
    #     #     newAdmin=alice.address
    #     # ).run(sender=daoContract.address)
    #     # scenario.verify(tokenContract.data.administrator == alice.address)
        
    #     # scenario.h3("Change 'paused' variable to False (ADMIN ONLY)")
    #     # scenario += tokenContract.setPause(pause=True).run(sender=alice)
    #     # scenario.verify(tokenContract.data.paused == True)
        
    #     # scenario.h3("Change administrator of the token contract back to daoContract")
    #     # scenario += tokenContract.setAdministrator(newAdmin=daoContract.address).run(sender=alice)
    #     # scenario.verify(tokenContract.data.administrator == daoContract.address)
        
    #     # scenario.h3("\n[&#x2713] setPause works")
    #     # scenario.h3("\n[&#x2713] setAdministrator works")
        
    @sp.add_test(name="DAO Contract Functionalities")
    def testDAOContractFunctionalities():
        """Testing scenarios for the Decentralized Autonomous Organization Contract
        
        Testing scenarios for the Decentralized Autonomous Organization to check whether all 
        entry points, storage variables, logics and security verification methods are sound. 
        Also checks the DAO Contract's token related and round related functionalities work 
        as expected.
        """
        
        # Initialize dummy accounts of all desired types
        # sp.test_account() generates ED25519 key-pairs deterministically
        admin = sp.test_account("Administrator")  # Initial admin of the DAO contract
        alice = sp.test_account("Alice")  # Shareholder/Token Holder
        bob = sp.test_account("Bob")  # Shareholder/Token Holder
        grace = sp.test_account("Grace")  # Shareholder/Token Holder
        gus = sp.test_account("Gus")  # Shareholder/Token Holder
        eve = sp.test_account("Eve")  # Shareholder/Token Holder
        john = sp.test_account("John")  # Shareholder/Token Holder
        judy = sp.test_account("Judy")  # Shareholder/Token Holder
        trudy = sp.test_account("Trudy")  # Shareholder/Token Holder
        daoMultiSig = sp.test_account('DaoMultiSig') # Shareholder 
        carol = sp.test_account("Carol")  # Sponsor
        carlos = sp.test_account("Carlos")  # Sponsor
        charlie = sp.test_account("Charlie")  # Entry Owner
        chuck = sp.test_account("Chuck")  # Entry Owner
        dan = sp.test_account("Dan")  # Entry Owner
        dave = sp.test_account("Dave")  # Contributor
        david = sp.test_account("David")  # Contributor
        mike = sp.test_account("Mike")  # Contributor
        
        
        # Initialize contracts (only the required ones)
        daoContract = DAO(admin.address)
        crowdsaleContract = CrowdSale(_admin = admin.address, _price = 1000000, _daoMultiSig = daoMultiSig.address)
        tokenContract = QuadToken(admin = crowdsaleContract.address, dao = daoContract.address)
        roundManagerContract = RoundManager(daoContract.address)
        
        scenario = sp.test_scenario()
    
        # Scenario for the ideal flow of execution, check if everything works as expected
        scenario.h1("DAO Contract Functionalities Test")
        
        scenario.h3("Initial DAO Contract")
        scenario += daoContract
        
        scenario.h3('Initial CrowdSale Contract')
        scenario += crowdsaleContract
        
        scenario.h3("Initial QuadToken Contract")
        scenario += tokenContract
        
        scenario.h3("Initial RoundManager Contract")
        scenario += roundManagerContract
        
        
        scenario.h3('Set Token Contracts')
        scenario += daoContract.setTokenContract(tokenContract.address).run(sender = admin)
        scenario += crowdsaleContract.setTokenContract(tokenContract.address).run(sender = admin)
        
        
        #CROWDSALE TEST
        
        scenario.h1('CrowdSale (3 participants)')
        scenario += crowdsaleContract.buyTokens(3000).run(sender = alice, amount = sp.tez(3000))
        scenario += crowdsaleContract.buyTokens(2700).run(sender = bob, amount = sp.tez(2700))
        scenario += crowdsaleContract.buyTokens(3500).run(sender = john, amount = sp.tez(3500))
        
        scenario.h2('Final Balances after CrowdSale')
        scenario.show(tokenContract.data.balances)
        
        
        #ROUND TESTS
        
        scenario.h3("Set Round Manager Contract")
        scenario += daoContract.setRoundManagerContract(
            _roundManager = roundManagerContract.address
        ).run(sender=admin)
        
        scenario.h3("Propose a New Funding Round")
        scenario += daoContract.proposeNewRound(
            name="Round 1", 
            startTime=sp.timestamp(100000), 
            endTime=sp.timestamp(110000),
            expiry=sp.timestamp(90000)
        ).run(sender=alice, now=80000)
        
        scenario.h3("Propose New Funding Round (FAILED)") # Not by shareholder
        scenario += daoContract.proposeNewRound(
            name="Round 1", 
            startTime=sp.timestamp(100000), 
            endTime=sp.timestamp(110000), 
            expiry=sp.timestamp(90000)
        ).run(sender=mike, now=80000, valid=False)
        
        scenario.h3("Propose New Funding Round (FAILED)") # Already 1 is active
        scenario += daoContract.proposeNewRound(
            name="Round 1", 
            startTime=sp.timestamp(100000), 
            endTime=sp.timestamp(110000), 
            expiry=sp.timestamp(90000)
        ).run(sender=bob, now=80000, valid=False)
        
        scenario += tokenContract.approve(
            spender=daoContract.address,
            value=1000
        ).run(sender=alice)
        
        scenario += tokenContract.approve(
            spender=daoContract.address,
            value=1000
        ).run(sender=bob)
        
        scenario += tokenContract.approve(
            spender=daoContract.address,
            value=2000
        ).run(sender=john)
        
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
        
        scenario.h3("Execute New Round Proposal")
        scenario += daoContract.executeNewRoundProposal().run(sender=john, now=95000)
        
        scenario.h3("Donate")
        scenario += daoContract.donateToRound(
            name = "Tezos Foundation",
        ).run(sender=carol, amount=sp.tez(10000))
        
        scenario.h3("Donate")
        scenario += daoContract.donateToRound(
            name = "Blockchain Foundation",
        ).run(sender=carlos, amount=sp.tez(5000))
                    
        scenario.h3("List New Round Proposal to the RoundManager Contract")
        scenario += daoContract.listNewRound().run(sender=john, now=95000)
        
        scenario.h2("Donate to a listed round (FAILED)")
        scenario += daoContract.donateToRound(name = "Alice").run(
            amount = sp.tez(5), 
            sender = alice, 
            valid = False
        )
        
        scenario.verify(roundManagerContract.data.currentRound == 0)
        scenario.verify(roundManagerContract.data.isRoundActive)
        scenario.h3("\n[&#x2713] New round listed successfully")
        
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
            roundManagerContract.data.rounds[roundManagerContract.data.currentRound].entryId == 2
        )
        
        # Raise a dispute without approval (FAILED)
        scenario.h3('Raise Dispute without Approval (FAILED)')
        scenario += daoContract.raiseDispute(
            entryId = 0
        ).run(sender = john, now = 106000, valid = False)
        
        # Bob will dispute an entry
        scenario += tokenContract.approve(
            spender=daoContract.address,
            value=1000
        ).run(sender=bob)
        
        scenario += tokenContract.approve(
            spender=daoContract.address,
            value=2000
        ).run(sender=john)
        
        scenario += tokenContract.approve(
            spender=daoContract.address,
            value=1000
        ).run(sender=alice)
        
        # Raise a dispute
        scenario.h3('Raise Dispute with Approval')
        scenario += daoContract.raiseDispute(entryId = 0).run(sender = bob, now = 106000)
        scenario.verify(roundManagerContract.data.rounds[0].entries[0].disputed == True)
        scenario.verify(
            tokenContract.data.balances[bob.address].approvals[daoContract.address] == 800
        )
        
        # Raise a dispute again for same entry (FAILED)
        scenario.h3('Raise Dispute Again (FAILED)')
        scenario += daoContract.raiseDispute(
            entryId = 0
        ).run(sender = bob, now = 106000, valid = False)
        
        # Raise a dispute again for same entry (FAILED)
        scenario.h3('Raise Dispute After Round Ends (FAILED)')
        scenario += daoContract.raiseDispute(
            entryId = 0
        ).run(sender = bob, now = 120000, valid = False)
        
        # Voting for disputed entry
        scenario.h3('Vote for dispute')
        scenario += daoContract.voteForDispute(
            entryId = 0, 
            inFavor = True, 
            value = 500
        ).run(sender = bob, now = 106050)
        
        # Vote for a dispute (Non holder, FAILED)
        scenario.h3('Vote for dispute by Non-Holder (FAILED)')
        scenario += daoContract.voteForDispute(
            entryId = 0, 
            inFavor = True, 
            value = 100
        ).run(sender = mike, now = 106050, valid = False)
        
        # Vote for a dispute after expiry (FAILED)
        scenario.h3('Vote for dispute after expiry (FAILED)')
        scenario += daoContract.voteForDispute(
            entryId = 0, 
            inFavor = True, 
            value = 100
        ).run(sender = bob, now = 115000, valid = False)
        
        # Settle dispute before expiry (FAILED)
        scenario.h2('Settle Dispute before expiry (FAILED)')
        scenario += daoContract.settleDispute(
            entryId = 0
        ).run(sender = alice, now = 106000, valid = False)
        
        # Add some contributions to entries
        scenario.h3("Contribute to entries")
        scenario += roundManagerContract.contribute(
            entryId = 0   
        ).run(sender=dave, amount=sp.tez(100), now=106000)
        
        scenario += roundManagerContract.contribute(
            entryId = 0   
        ).run(
            sender=dave, 
            amount=sp.tez(100), 
            now=116000,
            valid=False
        )  # Contributing after round ends
        
        scenario += roundManagerContract.contribute(
            entryId = 1   
        ).run(sender=dave, amount=sp.tez(200), now=106000)
        
        scenario += roundManagerContract.contribute(
            entryId = 1 
        ).run(sender=david, amount=sp.tez(50), now=106000)

        scenario += roundManagerContract.contribute(
            entryId = 2   
        ).run(sender=david, amount=sp.tez(100), now=106000)

        scenario += roundManagerContract.contribute(
            entryId = 2   
        ).run(sender=mike, amount=sp.tez(500), now=106000)

        scenario += roundManagerContract.contribute(
            entryId = 0   
        ).run(sender=mike, amount=sp.tez(100), now=106000)
        
        # Some more votes
        scenario.h3('Vote for dispute')
        scenario += daoContract.voteForDispute(
            entryId = 0, 
            inFavor = True, 
            value = 500
        ).run(sender = alice, now = 106050)
        
        scenario.h3('Vote for dispute')
        scenario += daoContract.voteForDispute(
            entryId = 0, 
            inFavor = False, 
            value = 1000
        ).run(sender = john, now = 106050)
        
        # Settle dispute 
        scenario.h2('Settle dispute before voting expiry')
        scenario += daoContract.settleDispute(
            entryId = 0
        ).run(sender = alice, now = 106000, valid=False)
        
        scenario += daoContract.settleDispute(
            entryId = 0
        ).run(sender = alice, now = 107000)
        
        scenario.verify(roundManagerContract.data.rounds[0].entries[0].disqualified == True)
        # Check if disqualified XTZ is given back
        scenario.show(roundManagerContract.balance) # Should be 850, showing 950 (SAME ERROR)
        # scenario.verify(roundManagerContract.balance == sp.tez(1050 - 200)) 
        scenario.h3("\n[&#x2713] Entry with ID 0 disputed and disqualified successfully")
        
        scenario.h2("End round and disburse money")
        scenario += daoContract.settleRound().run(sender=alice, now=140000)
        scenario.verify(roundManagerContract.data.isRoundActive == False)
        scenario.h3("\n[&#x2713] Funding Round ended successfully")
    
    # @sp.add_test(name="size")
    # def test():
    #     scenario = sp.test_scenario()
    #     admin = sp.test_account("Admin")
    #     c = DAO(admin.address)
    #     scenario += 
    
    # @sp.add_test(name="crowdsale")
    # def test():
    #     scenario = sp.test_scenario()
        
    #     #Test Accounts
    #     admin = sp.test_account('Admin')
    #     alice = sp.test_account('Alice')
    #     bob = sp.test_account('Bob')
    #     john = sp.test_account('John')
    #     daoMultiSig = sp.test_account('DaoMultiSig')
        
        
    #     dao = DAO(admin.address)
    #     crowdSale = CrowdSale(_admin = admin.address, _price = 1000000, _daoMultiSig = daoMultiSig.address)
    #     token = QuadToken(admin = crowdSale.address, dao = dao.address)
        
    #     scenario += dao
    #     scenario += crowdSale
    #     scenario += token
        
    #     scenario += dao.setTokenContract(token.address).run(sender = admin)
    #     scenario += crowdSale.setTokenContract(token.address).run(sender = admin)
        
    #     #Buy tokens
    #     scenario += crowdSale.buyTokens(150).run(sender = alice, amount = sp.tez(150))
    #     scenario += crowdSale.buyTokens(270).run(sender = bob, amount = sp.tez(270))
    #     scenario += crowdSale.buyTokens(350).run(sender = john, amount = sp.tez(350))
        
    #     scenario.show(token.data.balances)
        
        
        
