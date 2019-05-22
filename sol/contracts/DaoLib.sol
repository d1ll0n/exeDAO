pragma solidity ^0.5.0;

library DaoLib {
  struct Daoist {
    uint shares;
  }

  enum RequirementType {
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

  struct Proposal {
    mapping(address => bool) voters; // Used with all
    uint yesVotes; // Used with all
    uint noVotes; // Used with all
    uint expiryBlock; // Used with all
    ProposalType proposalType; // Used with all
    RequirementType requirementType; // Used with: SetRequirementType
    uint amount; // Used with: Disburse, MintShares, SendEther
    address payable recipient; // Used with: MintShares, SendEther
    bytes32 callDataHash; // Used with: Execute, SetMethod, RunMethod
    string method; // Used with: SetMethod, RunMethod, DeleteMethod
  }

  function isProposalApproved (Proposal memory proposal, uint daoistCount)
  internal pure returns (bool) {
    RequirementType requirementType = proposal.requirementType;
    return (
      requirementType == RequirementType.Plurality
        ? proposal.yesVotes > proposal.noVotes
        : requirementType == RequirementType.Majority
          ? proposal.yesVotes * 2 > daoistCount
          : (
              requirementType == RequirementType.SuperMajority &&
              proposal.yesVotes * 2 > daoistCount * 3
            )
    );
  }
}