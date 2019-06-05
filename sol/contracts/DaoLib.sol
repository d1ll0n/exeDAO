pragma solidity ^0.5.5;

library DaoLib {
  struct Proposal {
    uint32 expiryBlock;
    uint32 yesVotes;
    uint32 noVotes;
    mapping(address => bool) voters;
  }

  struct ProposalOutput {
    uint32 expiryBlock;
    uint32 yesVotes;
    uint32 noVotes;
    uint proposalIndex;
  }

  struct BuyRequest {
    uint lockedwei;
    uint32 amount;
  }
  
  function isApproved (
    Proposal memory proposal, uint8 requirement,
    uint32 total, uint32 proposalDuration
  ) internal view returns (bool approved) {
    uint yes = proposal.yesVotes;
    uint no = proposal.noVotes;
    uint expiry = proposal.expiryBlock;
    assembly {
      switch requirement
      case 1 { // Basic Majority
        approved := or(
          gt(mul(yes, 0x2), total),
          and(gt(mul(sub(number, expiry), 0x2), proposalDuration), gt(yes, no))
        )
      }
      case 2 { approved := gt(mul(yes, 0x2), total) } // Absolute Majority
      case 3 { approved := gt(mul(yes, 0x3), mul(total, 0x2)) } // Super Majority
      case 4 { approved := gt(mul(yes, 0xa), mul(total, 0x9)) } // Ultra Majority
      default { revert(0,0) }
    }
  }
}