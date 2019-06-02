pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "./DaoLib.sol";
import "./Shared.sol";

/**
 * @title Permissioned
 * @dev Configurable permissions for function execution.
*/
contract Permissioned is Shared {
  using DaoLib for DaoLib.Proposal;

  uint32 public proposalDuration;
  uint public lastExpiredProposal;
  DaoLib.Proposal[] public proposals;
  mapping(bytes32 => uint) public proposalIndices;
  mapping(bytes4 => DaoLib.ProposalRequirement) public proposalRequirements;

  event ProposalSubmission(address indexed submitter, bytes32 indexed proposalHash, uint64 votesCast, bool vote);
  event ProposalVote(address indexed voter, bytes32 indexed proposalHash, uint64 votesCast, bool vote);
  event ProposalApproval(address indexed voter, bytes32 indexed proposalHash);
  event ProposalExpiration(bytes32 indexed proposalHash);

  constructor(
    uint64 shares, bytes4[] memory funcSigs, uint8[] memory requirements,
    uint32 _proposalDuration
  ) public payable Shared(shares) {
    require(funcSigs.length == requirements.length, "Inconsistent inputs");
    for (uint i = 0; i < funcSigs.length; i++) {
      DaoLib.ProposalRequirement req = DaoLib.ProposalRequirement(requirements[i]);
      require(req != DaoLib.ProposalRequirement.Default, "Can not set empty requirement");
      proposalRequirements[funcSigs[i]] = req;
    }
    proposalDuration = _proposalDuration;
    proposals.push(DaoLib.Proposal({
      expiryBlock: 0,
      yesVotes: 0,
      noVotes: 0
    }));
  }

  function mintShares(address recipient, uint64 amount) external {
    if (voteAndContinue()) _mintShares(recipient, amount);
  }

  /**
  * @dev Set the requirement for execution of a function.
  */
  function setProposalRequirement(bytes4 funcSig, DaoLib.ProposalRequirement requirement) external {
    require(
      !(requirement == DaoLib.ProposalRequirement.Default || funcSig == msg.sig),
      "Invalid requirement type"
    );
    if (voteAndContinue()) proposalRequirements[funcSig] = requirement;
  }

  /**
  * @dev Call _submitOrVote() and return true if the proposal is approved, false if not.
  */
  function voteAndContinue() internal returns (bool) {
    bytes32 proposalHash = keccak256(msg.data);
    (DaoLib.Proposal memory proposal, uint index) = _submitOrVote(proposalHash, true);
    DaoLib.ProposalRequirement requirement = proposalRequirements[msg.sig];
    require(requirement != DaoLib.ProposalRequirement.Default, "Requirement not set for function");
    bool isApproved = proposal.isApproved(requirement, totalShares, proposalDuration);
    if (isApproved) {
      delete proposals[index];
      delete proposalIndices[proposalHash];
      emit ProposalApproval(msg.sender, proposalHash);
    }
    return isApproved;
  }

  /**
  * @dev Cancel a proposal if it has expired.
  */
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

  /**
  * @dev Create a proposal if it does not exist, vote on it otherwise.
  */
  function _submitOrVote(bytes32 proposalHash, bool vote) internal returns (DaoLib.Proposal memory, uint) {
    uint64 shares = getShares();
    uint index = proposalIndices[proposalHash];
    if (index == 0) {
      index = proposals.length;
      proposalIndices[proposalHash] = index;
      proposals.push(DaoLib.Proposal({
        expiryBlock: uint64(block.number + proposalDuration),
        yesVotes: vote ? shares : 0,
        noVotes: vote ? 0 : shares
      }));
      proposals[index].voters[msg.sender] = true;
      emit ProposalSubmission(msg.sender, proposalHash, shares, vote);
    } else {
      DaoLib.Proposal storage proposal = proposals[index];
      if (!proposal.voters[msg.sender] && (proposal.expiryBlock > block.number)) {
        proposal.voters[msg.sender] = true;
        proposal.yesVotes = uint64(proposal.yesVotes.add(shares));
        emit ProposalVote(msg.sender, proposalHash, shares, vote);
      }
    }
    return (proposals[index], index);
  }

  function submitOrVote(bytes32 proposalHash, bool vote) external returns(uint, uint, uint) {
    (DaoLib.Proposal memory proposal,) = _submitOrVote(proposalHash, vote);
    return(proposal.yesVotes, proposal.noVotes, proposal.expiryBlock);
  }
}