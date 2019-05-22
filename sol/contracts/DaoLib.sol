pragma solidity ^0.5.0;

library DaoLib {
  enum ProposalRequirement {
    Default,
    Plurality, // yes > no
    Majority, // yes > (memberCount / 2)
    SuperMajority // yes > (memberCount * 2/3)
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
    uint128 yesVotes;
    uint128 noVotes;
  }

  struct ProposalData {
    uint8 proposalType; // Used with all
    uint128 value; // Used with: Disburse, MintShares, SendEther
    address payable recipient; // Used with: MintShares, SendEther
    bytes32 callDataHash; // Used with: Execute
    bytes callData; // Used with: Execute
  }

  struct ShareSale {
    uint128 shares;
    uint128 price;
    uint64 expiryBlock;
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

}