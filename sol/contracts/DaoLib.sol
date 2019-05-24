pragma solidity ^0.5.0;

library DaoLib {
  enum ProposalRequirement {
    Default,
    Plurality, // yes > no
    Majority, // yes > (memberCount / 2)
    SuperMajority, // yes > (memberCount * 2/3)
    NoRequirement
  }

  enum ProposalType {
    Default,
    Disburse, // Send profits to daoists
    SellShares, // Allow some shares to be minted for the current price
    MintShares, // Give shares to new/existing daoist - optionally require ether
    SendEther, // Send ether to an address
    Execute, // Run sanitized bytecode as delegatecall
    SetProposalRequirement // Modify the approval requirement for a proposal type
  }

  struct ProposalMeta {
    mapping(address => bool) voters;
    uint64 expiryBlock;
    uint64 yesVotes;
    uint64 noVotes;
  }

  struct ProposalData {
    uint8 proposalType; // Used with all
    uint128 value; // Used with: Disburse, MintShares, SendEther
    address payable recipient; // Used with: MintShares, SendEther
    bytes callData; // Used with: Execute
  }

  struct ShareSale {
    uint64 expiryBlock;
    uint64 shares;
    uint128 price;
  }

  function isProposalApproved (
    ProposalRequirement requirementType, uint yesVotes, uint noVotes, uint totalShares
  ) internal pure returns (bool) {
    return (
      requirementType == ProposalRequirement.Plurality
        ? yesVotes > noVotes
        : requirementType == ProposalRequirement.Majority
          ? yesVotes * 2 > totalShares
          : requirementType == ProposalRequirement.SuperMajority &&
            yesVotes * 3 > totalShares * 2
    );
  }

  function hasRequiredProperties(ProposalData memory proposal)
  internal pure returns (bool) {
    ProposalType proposalType = ProposalType(proposal.proposalType);
    if (proposalType == ProposalType.Default) return false;
    if (proposalType == ProposalType.Disburse) return proposal.value > 0;
    if (proposalType == ProposalType.SellShares)
      return proposal.callData.length == 8;
    if (proposalType == ProposalType.MintShares || proposalType == ProposalType.SendEther)
      return proposal.value > 0 && proposal.recipient != address(0);
    if (proposalType == ProposalType.Execute) return proposal.callData.length > 0;
    if (proposalType == ProposalType.SetProposalRequirement) {
      uint8 pType = uint8(proposal.callData[0]);
      uint8 pReq = uint8(proposal.callData[1]);
      return pType != 0 && pReq != 0 && pType != 6;
    }
  }
}