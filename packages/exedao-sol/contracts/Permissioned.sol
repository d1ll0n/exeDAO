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

  uint64 public proposalDuration;
  uint64 public lastExpiredProposal;
  DaoLib.Proposal[] public proposals;
  mapping(bytes32 => uint) public proposalIndices;
  mapping(bytes4 => uint8) public approvalRequirements;
  mapping(bytes32 => bytes32) public proposalMetaHashes;

  event ProposalSubmission(address indexed submitter, bytes32 indexed proposalHash, bytes32 metaHash, uint64 votesCast);
  event ProposalVote(address indexed voter, bytes32 indexed proposalHash, uint64 votesCast);
  event ProposalApproval(address indexed voter, bytes32 indexed proposalHash);
  event ProposalExpiration(bytes32 indexed proposalHash);

  constructor(
    uint64 shares, uint64 _proposalDuration,
    bytes4[] memory funcSigs, uint8[] memory requirements
  ) public payable Shared(shares) {
    require(funcSigs.length == requirements.length, "Inconsistent inputs");
    for (uint i = 0; i < funcSigs.length; i++) {
      uint8 approvalRequirement = requirements[i];
      require(
        approvalRequirement < 101 || approvalRequirement == 255,
        "Can not set empty requirement"
      );
      approvalRequirements[funcSigs[i]] = approvalRequirement;
    }
    proposalDuration = _proposalDuration;
    /*
    Since we may want to re-use the same input data for a proposal and proposals are identified by their hashes,
    we have to store proposals in an array to avoid expensive mapping destruction for the record of who has voted
    once a proposal is finished. When checking if a proposal exists or not, we check if it has an index in the array
    (given by proposalIndices); thus the proposals array must be initialized with an empty value so no proposal ever has index 0.
    */
    proposals.push(DaoLib.Proposal(0, 0, 0));
  }

  function votesNeeded (uint64 votes, uint8 approvalRequirement)
  internal view returns (uint64 needed) {
    if (approvalRequirement == 255) return 0;
    uint64 totalNeeded = 1+totalShares*approvalRequirement/100;
    needed = votes >= totalNeeded ? 0 : totalNeeded-votes;
  }

  /// @dev allows clients to retrieve index and proposal data in one call
  function getProposal(bytes32 proposalHash) public view
  returns (DaoLib.ProposalOutput memory ret) {
    uint index = proposalIndices[proposalHash];
    DaoLib.Proposal memory proposal = proposals[index];
    ret = DaoLib.ProposalOutput(
      proposalHash, proposalMetaHashes[proposalHash],
      proposal.votes, proposal.expiryBlock, index
    );
  }

  function getOpenProposals() external view
  returns (DaoLib.ProposalOutput[] memory ret) {
    uint size = proposals.length - lastExpiredProposal - 1;
    ret = new DaoLib.ProposalOutput[](size);
    for (uint i = 0; i < size; i++) {
      uint index = lastExpiredProposal + i + 1;
      DaoLib.Proposal memory proposal = proposals[index];
      bytes32 proposalHash = proposal.proposalHash;
      ret[i] = DaoLib.ProposalOutput(
        proposalHash, proposalMetaHashes[proposalHash],
        proposal.votes, proposal.expiryBlock, index
      );
    }
  }

  function mintShares(address recipient, uint64 amount) external {
    if (voteAndContinue()) _mintShares(recipient, amount);
  }

  function getApprovalRequirements(bytes4[] calldata funcSigs)
  external view returns (uint8[] memory requirements) {
    uint size = funcSigs.length;
    requirements = new uint8[](size);
    for (uint i = 0; i < size; i++) requirements[i] = approvalRequirements[funcSigs[i]];
  }

  /** @dev Set the requirement for execution of a function. */
  function setApprovalRequirement(bytes4 funcSig, uint8 approvalRequirement) external {
    require(funcSig != msg.sig, "Can not modify requirement for setApprovalRequirement");
    require(
      approvalRequirement < 101 || approvalRequirement == 255,
      "Requirement must be percentage, 0 (disallowed) or 255 (no approval needed)"
    );
    if (voteAndContinue()) approvalRequirements[funcSig] = approvalRequirement;
  }

  /** @dev Call _submitOrVote() and return true if the proposal is approved, false if not. */
  function voteAndContinue() internal returns (bool) {
    bytes32 proposalHash = keccak256(msg.data);
    (uint index, bool isApproved) = _submitOrVote(proposalHash, true);
    if (isApproved) {
      delete proposals[index];
      delete proposalIndices[proposalHash];
      if (proposalMetaHashes[proposalHash] != 0) delete proposalMetaHashes[proposalHash];
      emit ProposalApproval(msg.sender, proposalHash);
    }
    return isApproved;
  }

  /** @dev Cancel a proposal if it has expired. */
  function closeProposal(bytes32 proposalHash) external {
    uint index = proposalIndices[proposalHash];
    DaoLib.Proposal memory proposal = proposals[index];
    if (proposal.expiryBlock <= block.number) {
      delete proposals[index];
      delete proposalIndices[proposalHash];
      if (proposalMetaHashes[proposalHash] != 0) delete proposalMetaHashes[proposalHash];
      if (index > lastExpiredProposal) lastExpiredProposal = uint64(index);
      emit ProposalExpiration(proposalHash);
    }
  }

  /** @dev Create a proposal if it does not exist, vote on it otherwise. */
  function _submitOrVote(bytes32 proposalHash, bool _internal)
  internal returns (uint index, bool approved) {
    uint64 shares = getShares();
    index = proposalIndices[proposalHash];
    if (index == 0) {
      index = proposals.length;
      proposalIndices[proposalHash] = index;
      proposals.push(DaoLib.Proposal(proposalHash, shares, uint64(block.number + proposalDuration)));
      proposals[index].voters[msg.sender] = true;
      emit ProposalSubmission(msg.sender, proposalHash, proposalMetaHashes[proposalHash], shares);
    } else {
      DaoLib.Proposal memory proposal = proposals[index];
      require(proposal.expiryBlock > block.number, "Proposal expired");
      uint64 votesLeft = votesNeeded(proposal.votes, approvalRequirements[msg.sig]);
      bool canVote = !proposals[index].voters[msg.sender];
      approved = (canVote && shares >= votesLeft) || votesLeft == 0;
      // for internal calls, we do not need to add votes if the proposal is approved
      if (approved && _internal) return (index, approved);
      if (canVote && votesLeft > 0) {
        proposals[index].voters[msg.sender] = true;
        proposals[index].votes = proposal.votes + shares;
        emit ProposalVote(msg.sender, proposalHash, shares);
      }
    }
  }

  function submitOrVote(bytes32 proposalHash) external returns(uint, uint) {
    (uint index,) = _submitOrVote(proposalHash, false);
    DaoLib.Proposal memory proposal = proposals[index];
    return(proposal.votes, proposal.expiryBlock);
  }

  /// @notice Create a proposal and set an ipfs hash for finding data about it.
  /// @dev The calldata for a proposal can be uploaded to IPFS with keccak sha256 as the hash algorithm,
  /// making this function unnecessary for proposals where the input can easily be decoded and no additional information is needed.
  /// For proposals to execute code or add extensions, it is useful to be able to share the raw code which compiles
  /// to the contract bytecode for easy verification of what is being executed without needing to audit the bytecode.
  /// For extra security, the IPFS hash could point to ciphertext which only daoists can decrypt via some key exchange.
  function submitWithMetaHash(bytes32 proposalHash, bytes32 metaHash) external returns(uint index) {
    require(proposalIndices[proposalHash] == 0, "Proposal already exists");
    proposalMetaHashes[proposalHash] = metaHash;
    (index,) = _submitOrVote(proposalHash, false);
  }
}