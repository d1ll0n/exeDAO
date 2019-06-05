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
  uint32 public lastExpiredProposal;
  DaoLib.Proposal[] public proposals;
  mapping(bytes32 => uint) public proposalIndices;
  mapping(bytes4 => uint8) public proposalRequirements;
  mapping(bytes32 => bytes32) public proposalIPFSHashes;

  event ProposalSubmission(address indexed submitter, bytes32 indexed proposalHash, uint32 votesCast, bool vote);
  event ProposalVote(address indexed voter, bytes32 indexed proposalHash, uint32 votesCast, bool vote);
  event ProposalApproval(address indexed voter, bytes32 indexed proposalHash);
  event ProposalExpiration(bytes32 indexed proposalHash);

  constructor(
    uint32 shares, uint32 _proposalDuration,
    bytes4[] memory funcSigs, uint8[] memory requirements
  ) public payable Shared(shares) {
    require(funcSigs.length == requirements.length, "Inconsistent inputs");
    for (uint i = 0; i < funcSigs.length; i++) {
      uint8 req = requirements[i];
      require(req > 0 && req < 5, "Can not set empty requirement");
      proposalRequirements[funcSigs[i]] = req;
    }
    proposalDuration = _proposalDuration;
    /*
    Since we may want to re-use the same input data for a proposal and proposals are identified by their hashes,
    we have to store proposals in an array to avoid expensive mapping destruction for the record of who has voted
    once a proposal is finished. When checking if a proposal exists or not, we check if it has an index in the array
    (given by proposalIndices); thus the proposals array must be initialized with an empty value so no proposal ever has index 0.
    */
    proposals.push(DaoLib.Proposal({
      expiryBlock: 0, yesVotes: 0, noVotes: 0
    }));
  }

  function getProposal(bytes32 proposalHash) external view
  returns (DaoLib.ProposalOutput memory ret) {
    DaoLib.Proposal memory proposal = proposals[proposalIndices[proposalHash]];
    ret = DaoLib.ProposalOutput({
      yesVotes: proposal.yesVotes,
      noVotes: proposal.noVotes,
      expiryBlock: proposal.expiryBlock,
      proposalIndex: proposalIndices[proposalHash]
    });
  }

  function getOpenProposals() external view
  returns (DaoLib.ProposalOutput[] memory ret) {
    uint size = proposals.length - lastExpiredProposal - 1;
    ret = new DaoLib.ProposalOutput[](size);
    for (uint i = 0; i < size; i++) {
      uint index = lastExpiredProposal + i + 1;
      DaoLib.Proposal memory proposal = proposals[index];
      ret[i] = DaoLib.ProposalOutput({
        yesVotes: proposal.yesVotes,
        noVotes: proposal.noVotes,
        expiryBlock: proposal.expiryBlock,
        proposalIndex: index
      });
    }
  }

  function mintShares(address recipient, uint32 amount) external {
    if (voteAndContinue()) _mintShares(recipient, amount);
  }

  /** @dev Set the requirement for execution of a function. */
  function setProposalRequirement(bytes4 funcSig, uint8 requirement) external {
    require(funcSig != msg.sig, "Can not modify requirement for set requirement");
    if (voteAndContinue()) proposalRequirements[funcSig] = requirement;
  }

  /** @dev Call _submitOrVote() and return true if the proposal is approved, false if not. */
  function voteAndContinue() internal returns (bool) {
    bytes32 proposalHash = keccak256(msg.data);
    (DaoLib.Proposal memory proposal, uint index) = _submitOrVote(proposalHash, true);
    bool isApproved = proposal.isApproved(proposalRequirements[msg.sig], totalShares, proposalDuration);
    if (isApproved) {
      delete proposals[index];
      delete proposalIndices[proposalHash];
      if (proposalIPFSHashes[proposalHash] != 0) delete proposalIPFSHashes[proposalHash];
      emit ProposalApproval(msg.sender, proposalHash);
    }
    return isApproved;
  }

  /** @dev Cancel a proposal if it has expired. */
  function cancelProposal(bytes32 proposalHash) public {
    uint index = proposalIndices[proposalHash];
    DaoLib.Proposal storage proposal = proposals[index];
    if (proposal.expiryBlock <= block.number) {
      delete proposals[index];
      delete proposalIndices[proposalHash];
      if (proposalIPFSHashes[proposalHash] != 0) delete proposalIPFSHashes[proposalHash];
      emit ProposalExpiration(proposalHash);
      if (index > lastExpiredProposal) lastExpiredProposal = uint32(index);
    }
  }

  /** @dev Create a proposal if it does not exist, vote on it otherwise. */
  function _submitOrVote(bytes32 proposalHash, bool vote)
  internal returns (DaoLib.Proposal memory, uint index) {
    uint32 shares = getShares();
    index = proposalIndices[proposalHash];
    if (index == 0) {
      index = proposals.length;
      proposalIndices[proposalHash] = index;
      proposals.push(DaoLib.Proposal({
        expiryBlock: uint32(block.number + proposalDuration),
        yesVotes: vote ? shares : 0,
        noVotes: vote ? 0 : shares
      }));
      proposals[index].voters[msg.sender] = true;
      emit ProposalSubmission(msg.sender, proposalHash, shares, vote);
    } else {
      DaoLib.Proposal storage proposal = proposals[index];
      if (!proposal.voters[msg.sender] && (proposal.expiryBlock > block.number)) {
        proposal.voters[msg.sender] = true;
        proposal.yesVotes = uint32(proposal.yesVotes.add(shares));
        emit ProposalVote(msg.sender, proposalHash, shares, vote);
      }
    }
    return (proposals[index], index);
  }

  function submitOrVote(bytes32 proposalHash, bool vote) external returns(uint, uint, uint) {
    (DaoLib.Proposal memory proposal,) = _submitOrVote(proposalHash, vote);
    return(proposal.yesVotes, proposal.noVotes, proposal.expiryBlock);
  }

  /// @notice Create a proposal and set an ipfs hash for finding data about it.
  /// @dev The calldata for a proposal can be uploaded to IPFS with keccak sha256 as the hash algorithm,
  /// making this function unnecessary for proposals where the input can easily be decoded. For proposals
  /// to execute code or add extensions, however, it is useful to be able to share the raw code which compiles
  /// to the contract bytecode for easy verification of what is going on without needing to audit the bytecode.
  /// For extra security, the IPFS hash could point to ciphertext which only daoists can decrypt via some key exchange.
  function submitWithIPFSHash(bytes32 proposalHash, bytes32 ipfsHash) external returns(uint index) {
    require(proposalIndices[proposalHash] == 0, "Proposal already exists");
    (,index) = _submitOrVote(proposalHash, true);
    proposalIPFSHashes[proposalHash] = ipfsHash;
  }
}