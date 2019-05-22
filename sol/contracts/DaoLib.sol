pragma solidity ^0.5.0;

library DaoLib {
  struct DaoMeta {
    uint128 totalShares;
    uint128 votingShares;
    uint64 proposalDuration;
    uint64 lastProposalBlock;
    uint128 totalDividendPoints;
    uint128 unclaimedDividendPoints;
  }

  struct Daoist {
    uint128 shares;
    uint64 lastVoteBlock;
    bool suspended;
    uint128 lastDividendPoints;
  }

  enum ProposalRequirement {
    Default,
    Plurality, // yes > no
    Majority, // yes > (memberCount / 2)
    SuperMajority // yes > (memberCount * 2/3)
  }

  enum ProposalType {
    Default,
    Disburse, // Send profits to daoists
    MintShares, // Give shares to new/existing daoist - optionally require ether
    SendEther, // Send ether to an address
    Execute, // Run sanitized bytecode as delegatecall
    SetMethod, // Bind a method (deployed sanitized bytecode) to a string
    DeleteMethod, // Remove a method binding and call selfdestruct on it if it was dao-generated
    RunMethod, // Run a method with input bytes as arguments, specified by method string
    SetRequirementType, // Modify the approval requirement for a proposal type
    SellShares // Allow some shares to be minted for the current price
  }

  struct ProposalMeta {
    mapping(address => bool) voters;
    uint64 expiryBlock;
    uint128 yesVotes;
    uint128 noVotes;
  }

  struct ProposalData {
    uint128 amount; // Used with: Disburse, MintShares, SendEther
    uint8 proposalType; // Used with all
    address payable recipient; // Used with: MintShares, SendEther
    bytes32 callDataHash; // Used with: Execute, SetMethod, RunMethod
    string method; // Used with: SetMethod, RunMethod, DeleteMethod
  }

  function isProposalApproved (
    ProposalRequirement requirementType, ProposalMeta memory proposal, uint daoistCount
  ) internal pure returns (bool) {
    return (
      requirementType == ProposalRequirement.Plurality
        ? proposal.yesVotes > proposal.noVotes
        : requirementType == ProposalRequirement.Majority
          ? proposal.yesVotes * 2 > daoistCount
          : requirementType == ProposalRequirement.SuperMajority &&
            proposal.yesVotes * 3 > daoistCount * 2
    );
  }

}