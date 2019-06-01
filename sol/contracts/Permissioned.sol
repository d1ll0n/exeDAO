pragma solidity ^0.5.6;
pragma experimental ABIEncoderV2;

import "./DaoLib.sol";
import "./Shared.sol";

contract Permissioned is Shared {
  using DaoLib for DaoLib.Proposal;

  uint64 public proposalDuration;
  uint public lastExpiredProposal;
  DaoLib.Proposal[] public proposals;
  mapping(bytes32 => uint) public proposalIndices;
  mapping(bytes4 => DaoLib.ProposalRequirement) public proposalRequirements;

  event ProposalSubmission(address indexed submitter, bytes32 indexed proposalHash, uint64 votesCast);
  event ProposalVote(address indexed voter, bytes32 indexed proposalHash, uint64 votesCast);
  event ProposalApproval(address indexed voter, bytes32 indexed proposalHash);
  event ProposalExpiration(bytes32 indexed proposalHash);

  function setProposalRequirement(bytes4 funcSig, DaoLib.ProposalRequirement requirement) external {
    require(
      !(requirement == DaoLib.ProposalRequirement.Default || funcSig == msg.sig),
      "Invalid requirement type"
    );
    if (!voteAndContinue()) return;
    proposalRequirements[funcSig] = requirement;
  }

  function voteAndContinue() internal returns (bool isApproved) {
    bytes32 proposalHash = keccak256(msg.data);
    (DaoLib.Proposal memory proposal, uint index) = submitOrVote(proposalHash);
    DaoLib.ProposalRequirement requirement = proposalRequirements[msg.sig];
    require(requirement != DaoLib.ProposalRequirement.Default, "Requirement not set for function");
    isApproved = proposal.isApproved(requirement, totalShares);
    if (isApproved) {
      delete proposals[index];
      delete proposalIndices[proposalHash];
      emit ProposalApproval(msg.sender, proposalHash);
    }
  }

  function cancelProposal(bytes32 proposalHash) public {
    uint index = proposalIndices[proposalHash];
    DaoLib.Proposal storage proposal = proposals[index];
    if (proposal.expiryBlock <= block.number) {
      delete proposals[index];
      delete proposalIndices[proposalHash];
      emit ProposalExpiration(proposalHash);
      if (index > lastExpiredProposal) lastExpiredProposal = index;
    }
  }

  function submitOrVote(bytes32 proposalHash) public returns (DaoLib.Proposal memory, uint) {
    uint64 shares = getShares();
    uint index = proposalIndices[proposalHash];
    DaoLib.Proposal storage proposal = proposals[index];
    if (proposal.yesVotes == 0) {
      proposalIndices[proposalHash] = proposals.length;
      proposals.push(DaoLib.Proposal({
        expiryBlock: uint64(block.number + proposalDuration),
        yesVotes: shares,
        noVotes: 0,
        voters: new bool[](0)
      }));
      proposal.voters[daoistIndices[msg.sender]] = true;
      emit ProposalSubmission(msg.sender, proposalHash, shares);
    } else if (!proposal.voters[daoistIndices[msg.sender]]) {
      proposal.voters[daoistIndices[msg.sender]] = true;
      proposal.yesVotes = uint64(proposal.yesVotes.add(shares));
      emit ProposalVote(msg.sender, proposalHash, shares);
    }
    return (proposal, index);
  }
}