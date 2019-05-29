pragma solidity ^0.5.6;

library DaoLib {
  enum ProposalRequirement {
    Default,
    Plurality, // yes > no
    Majority, // yes > (memberCount / 2)
    SuperMajority, // yes > (memberCount * 2/3)
    UltraMajority // yes > (memberCount * 9/10)
  }

  struct Proposal {
    uint64 expiryBlock;
    uint64 yesVotes;
    uint64 noVotes;
    bool[] voters;
  }

  function isApproved (Proposal memory proposal,
  ProposalRequirement requirementType, uint64 totalShares) internal pure returns (bool) {
    return (
      requirementType == ProposalRequirement.Plurality
        ? proposal.yesVotes > proposal.noVotes
        : requirementType == ProposalRequirement.Majority
          ? proposal.yesVotes * 2 > totalShares
          : requirementType == ProposalRequirement.SuperMajority
            ? proposal.yesVotes * 3 > totalShares * 2
            : requirementType == ProposalRequirement.UltraMajority &&
              proposal.yesVotes * 10 > totalShares * 9
    );
  }
}