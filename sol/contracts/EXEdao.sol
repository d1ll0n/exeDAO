pragma solidity ^0.5.0;
import "./DaoLib.sol";
import "./SafeMath.sol";

/*
---TODO---
- DILUTION BOUND
- Stake some ether on proposal to reimburse final executor
*/

contract EXEdao {
  mapping(uint => DaoLib.RequirementType) public proposalRequirements;
  mapping(string => address payable) public methodAddresses;
  mapping(address => uint) public daoists;
  uint public proposalDuration;
  DaoLib.Proposal[] public proposals;
  
  function isProposalApproved (uint proposalType, uint yesVotes, uint noVotes, uint daoistCount)
  internal view returns (bool) {
    DaoLib.RequirementType requirementType = proposalRequirements[uint(proposalType)];
    return (
      requirementType == DaoLib.RequirementType.Plurality
        ? yesVotes > noVotes
        : requirementType == DaoLib.RequirementType.Majority
          ? yesVotes * 2 > daoistCount
          : (
              requirementType == DaoLib.RequirementType.SuperMajority &&
              yesVotes * 2 > daoistCount * 3
            )
    );
  }

  function requireDaoist() internal { require(daoists[msg.sender] > 0, "Not a daoist."); }

  function submitProposal
  (
    uint proposalType, uint requirementType, uint amount,
    address payable recipient, bytes32 callDataHash, string calldata method
  ) external
  {
    requireDaoist();
    require(proposalType != 0, "Invalid proposal type.");
    DaoLib.Proposal storage proposal = proposals[proposals.length];
    proposal.expiryBlock = block.number + proposalDuration;
    proposal.proposalType = DaoLib.ProposalType(proposalType);
    if (requirementType != 0) proposal.requirementType = DaoLib.RequirementType(requirementType);
    if (amount != 0) proposal.amount = amount;
    if (recipient != address(0)) proposal.recipient = recipient;
    if (callDataHash != 0) proposal.callDataHash = callDataHash;
    if (bytes(method).length != 0) proposal.method = method;
    proposal.yesVotes = 1;
    proposal.voters[msg.sender] = true;
  }

  function voteProposal(uint proposalIndex, bool vote) external {
    requireDaoist();
    DaoLib.Proposal storage proposal = proposals[proposalIndex];
    require(proposal.yesVotes != 0, "Proposal not open");
    require(!proposal.voters[msg.sender], "Daoist already voted");
    if (vote) proposal.yesVotes++;
    else proposal.noVotes++;
  }

  function processProposal(uint proposalIndex) {
    
  }


}