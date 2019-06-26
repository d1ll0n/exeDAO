pragma solidity ^0.5.5;

library Proposals {
  struct Proposal {
    bytes32 proposalHash;
    uint64 votes;
    uint64 expiryBlock;
    mapping(address => bool) voters;
  }

  struct ProposalOutput {
    bytes32 proposalHash;
    bytes32 metaHash;
    uint64 votes;
    uint64 expiryBlock;
    uint256 proposalIndex;
  }

  function votesRemaining (uint64 totalShares, uint64 votes, uint8 approvalRequirement)
  internal pure returns (uint64) {
    uint64 totalNeeded = totalShares * approvalRequirement / 100;
    if (votes >= totalNeeded) return 0;
    else return totalNeeded - votes;
  }
}