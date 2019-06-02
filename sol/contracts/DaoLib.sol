pragma solidity ^0.5.5;

library DaoLib {
  enum ProposalRequirement {
    Default,
    BasicMajority, // yes > no
    AbsoluteMajority, // yes > (memberCount / 2)
    SuperMajority, // yes > (memberCount * 2/3)
    UltraMajority // yes > (memberCount * 9/10)
  }

  struct Proposal {
    uint64 expiryBlock;
    uint64 yesVotes;
    uint64 noVotes;
    mapping(address => bool) voters;
  }

  function isApproved (
    Proposal memory proposal, ProposalRequirement requirementType,
    uint64 totalShares, uint32 proposalDuration
  ) internal view returns (bool) {
    return (
      requirementType == ProposalRequirement.BasicMajority
        ? proposal.yesVotes > proposal.noVotes &&
          (block.number - proposal.expiryBlock) * 2 >= proposalDuration
        : requirementType == ProposalRequirement.AbsoluteMajority
          ? proposal.yesVotes * 2 > totalShares
          : requirementType == ProposalRequirement.SuperMajority
            ? proposal.yesVotes * 3 > totalShares * 2
            : requirementType == ProposalRequirement.UltraMajority &&
              proposal.yesVotes * 10 > totalShares * 9
    );
  }
}