pragma solidity ^0.5.5;

library DaoLib {
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
    uint proposalIndex;
  }

  struct BuyRequest {
    uint lockedwei;
    uint64 amount;
  }
}