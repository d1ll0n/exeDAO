pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "./BaseDAO.sol";
import "./lib/SignatureUnpack.sol";
import "./storage/PermissionedStorage.sol";
import "./interfaces/IPermissioned.sol";

/**
 * @title Permissioned
 * @notice Generic contract for creating, cancelling and processing _proposals to execute functions.
 * @dev Approval requirements are set per function signature.
 */
contract Permissioned is IPermissioned, BaseDAO, PermissionedStorage {
  using SignatureUnpack for bytes;

  event ProposalSubmission(address indexed submitter, bytes32 indexed proposalHash, bytes32 metaHash, uint64 votesCast);
  event ProposalVote(address indexed voter, bytes32 indexed proposalHash, uint64 votesCast);
  event ProposalApproval(address indexed voter, bytes32 indexed proposalHash);
  event ProposalExpiration(bytes32 indexed proposalHash);

  constructor(
    uint64 shares, uint64 proposalDuration,
    bytes4[] memory funcSigs, uint8[] memory requirements
  ) public payable BaseDAO(shares) {
    require(funcSigs.length == requirements.length, "Inconsistent inputs");
    for (uint256 i = 0; i < funcSigs.length; i++) {
      uint8 approvalRequirement = requirements[i];
      require(
        approvalRequirement < 101 || approvalRequirement == 255,
        "Can not set empty requirement"
      );
      _approvalRequirements[funcSigs[i]] = approvalRequirement;
    }
    _proposalDuration = proposalDuration;
  }

  function setProposalDuration(uint64 duration) external {
    if (_voteAndContinue()) _proposalDuration = duration;
  }

  function mintShares(address recipient, uint64 amount) external {
    if (_voteAndContinue()) _mintShares(recipient, amount);
  }

  /**
   * @dev Set the requirement for execution of a function.
   * @param funcSig The signature of the function which approval is being set for.
   * funcSig can not be the signature for setApprovalRequirement.
   * @param approvalRequirement Percentage of shares which must be met for an approval to be accepted.
   * If approvalRequirement is 0, the function can not be called by anyone. If it is 255, it does not require approval.
   */
  function setApprovalRequirement(bytes4 funcSig, uint8 approvalRequirement) external {
    require(funcSig != msg.sig, "ExeDAO: Can not modify requirement for setApprovalRequirement");
    require(approvalRequirement < 101 || approvalRequirement == 255, "ExeDAO: Bad approvalRequirement");
    if (_voteAndContinue()) _approvalRequirements[funcSig] = approvalRequirement;
  }

  function submitOrVote(bytes32 proposalHash) external returns(uint, uint) {
    uint64 shares = _getShares();
    Indices.Index memory index = _proposalIndices[proposalHash];
    _submitOrVote(msg.sender, proposalHash, shares, index);
    Proposals.Proposal memory proposal = _proposals[index.index];
    return(proposal.votes, proposal.expiryBlock);
  }

  /**
   * @notice Create a proposal and set an ipfs hash for finding data about it.
   * @dev The calldata for a proposal can be uploaded to IPFS with keccak-sha256 as the hash algorithm.
   * For proposals to execute code or add extensions, it is useful to be able to share the raw code which compiles
   * to the contract bytecode for easy verification of what is being executed without needing to audit the bytecode.
   * For private proposals, the IPFS hash could point to ciphertext which only daoists can decrypt via some key exchange.
   */
  function submitWithMetaHash(bytes32 proposalHash, bytes32 metaHash) external returns(uint256 index) {
    uint64 shares = _getShares();
    Indices.Index memory _index = _proposalIndices[proposalHash];
    require(!_index.exists, "ExeDAO: Proposal already exists");
    index = _index.index;
    _submitOrVote(msg.sender, proposalHash, shares, _index);
    _proposalMetaHashes[proposalHash] = metaHash;
  }

  /** @dev Cancel a proposal if it has expired. */
  function closeProposal(bytes32 proposalHash) external {
    Indices.Index memory index = _proposalIndices[proposalHash];
    Proposals.Proposal memory proposal = _proposals[index.index];
    if (proposal.expiryBlock <= block.number) {
      delete _proposals[index.index];
      delete _proposalIndices[proposalHash];
      if (_proposalMetaHashes[proposalHash] != 0) delete _proposalMetaHashes[proposalHash];
      if (index.index > _lastExpiredProposal) _lastExpiredProposal = uint64(index.index);
      emit ProposalExpiration(proposalHash);
    }
  }

  function supplyOfflineVotesWithCall(
    bytes calldata wrappedCalldata,
    bytes[] calldata sigs,
    uint256[] calldata nonces,
    bytes32[] calldata proposalHashes
  ) external returns (bytes memory) {
    for (uint256 i = 0; i < sigs.length; i++) {
      address voter = sigs[i].recoverOffline(nonces[i], proposalHashes[i]);
      require(!_offlineNonces[voter][nonces[i]], "ExeDAO: Nonce already used");
      _offlineNonces[voter][nonces[i]] = true;
      DaoLib.DaoistOutput memory daoist = getDaoist(voter);
      require(daoist.shares > 0, "ExeDAO: Signature supplied from non-daoist");
      uint64 shares = daoist.shares;
      Indices.Index memory index = _proposalIndices[proposalHashes[i]];
      _submitOrVote(voter, proposalHashes[i], shares, index);
    }
    (, bytes memory retval) = address(this).delegatecall(wrappedCalldata);
    // if this call throws it doesn't matter, allow anyone to pay the gas to submit offline signatures even in the absence of valid calldata
    return retval;
  }

  /**
   * @dev Call _submitOrVote() and return true if the proposal is approved, false if not.
   */
  function _voteAndContinue() internal returns (bool) {
    bytes32 proposalHash = keccak256(msg.data);
    (uint64 shares, Indices.Index memory index, bool approved) = _preProcessProposal(proposalHash);
    if (approved) {
      if (index.exists) {
        delete _proposals[index.index];
        delete _proposalIndices[proposalHash];
        if (_proposalMetaHashes[proposalHash] != 0) delete _proposalMetaHashes[proposalHash];
      }
      emit ProposalApproval(msg.sender, proposalHash);
    } else _submitOrVote(msg.sender, proposalHash, shares, index);
    return approved;
  }

  /**
   * @dev Determines whether a proposal would be accepted given the caller's votes.
   */
  function _preProcessProposal(bytes32 proposalHash) internal view
  returns (uint64 shares, Indices.Index memory index, bool approved) {
    shares = _getShares();
    uint64 totalNeeded = Proposals.votesRemaining(_totalShares, 0, _approvalRequirements[msg.sig]);
    index = _proposalIndices[proposalHash];
    if (!index.exists) approved = shares >= totalNeeded;
    else approved = shares >= (totalNeeded - _proposals[index.index].votes);
  }

  /**
   * @dev Create a proposal if it does not exist, vote on it otherwise.
   */
  function _submitOrVote(address voter, bytes32 proposalHash, uint64 shares, Indices.Index memory index) internal {
    if (!index.exists) {
      Indices.Index memory _index = Indices.Index(true, uint248(_proposals.length));
      _proposalIndices[proposalHash] = _index;
      _proposals.push(Proposals.Proposal(proposalHash, shares, uint64(block.number + _proposalDuration)));
      _proposals[_index.index].voters[voter] = true;
      emit ProposalSubmission(voter, proposalHash, _proposalMetaHashes[proposalHash], shares);
    } else {
      Proposals.Proposal storage proposal = _proposals[index.index];
      require(proposal.expiryBlock > block.number, "ExeDAO: Proposal expired");
      if (!proposal.voters[voter]) {
        proposal.voters[voter] = true;
        proposal.votes = uint64(proposal.votes.add(shares));
        emit ProposalVote(voter, proposalHash, shares);
      }
    }
  }
}
