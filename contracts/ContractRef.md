## QuadToken Contract

**FA1.2 Token Contract that would be used by the DAO shareholders for voting rights**

### Overview
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

## DAO Contract

**Contract for the Decentralized Autonomous Organization that would control all the management
        for the funding rounds** 

### Overview
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

### Extended Descriptions

    Vote:
        Vote for the proposal passed as 'subject' in the method and put your tokens as stake
        in the DAO which will be proportional to your vote in the proposal as per the quadratic
        funding scheme. DAO Contract first has to be approved to transfer the voter's tokens from
        the voter's account to the DAO Contract otherwise the vote attempt would fail.

## RoundManager Contract

**Contract for managing the rounds of the Quadratic Funding scheme**
    
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