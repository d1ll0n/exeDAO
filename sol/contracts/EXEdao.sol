pragma solidity ^0.5.0;
import "./DaoLib.sol";
import "./SafeMath.sol";

contract EXEdao {
  mapping(uint => DaoLib.RequirementType) proposalRequirements;
  
  function hasRequiredVotes(DaoLib.RequirementType requirementType, uint yesVotes, uint noVotes)
  internal pure returns (bool) {
    return (
      (
        requirementType == DaoLib.RequirementType.Plurality &&
        yesVotes > noVotes
      ) ||
      (
        requirementType == DaoLib.RequirementType.Majority
      )
    );
  }



}