pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "../lib/Proposals.sol";
import "../lib/Indices.sol";

/**
 * @title PermissionedStorage
 * @author Dillon Kellar, Raymond Pulver
 * @dev Storage and getters for Permissioned.sol
 * @notice Makes the contract less cluttered by separating getters and storage setup into a separate contract.
 */
contract PermissionedStorage {
  uint64 internal _proposalDuration;
  uint64 internal _lastExpiredProposal;
  Proposals.Proposal[] internal _proposals;
  mapping(bytes32 => Indices.Index) internal _proposalIndices;
  mapping(bytes4 => uint8) internal _approvalRequirements;
  mapping(bytes32 => bytes32) internal _proposalMetaHashes;
  mapping(address => mapping(uint256 => bool)) internal _offlineNonces;

  function getApprovalRequirement(bytes4 funcSig) external view returns (uint8 requirement) {
    requirement = _approvalRequirements[funcSig];
  }

  function getApprovalRequirements(bytes4[] calldata funcSigs) external view
  returns (uint8[] memory requirements) {
    uint256 size = funcSigs.length;
    requirements = new uint8[](size);
    for (uint256 i = 0; i < size; i++) requirements[i] = _approvalRequirements[funcSigs[i]];
  }

  function getOpenProposals() external view
  returns (Proposals.ProposalOutput[] memory proposals) {
    uint256 size = _proposals.length - _lastExpiredProposal - 1;
    proposals = new Proposals.ProposalOutput[](size);
    for (uint256 i = 0; i < size; i++) {
      uint256 index = _lastExpiredProposal + i + 1;
      Proposals.Proposal memory proposal = _proposals[index];
      bytes32 proposalHash = proposal.proposalHash;
      proposals[i] = Proposals.ProposalOutput(
        proposalHash, _proposalMetaHashes[proposalHash],
        proposal.votes, proposal.expiryBlock, index
      );
    }
  }

  /** @dev allows clients to retrieve index and proposal data in one call */
  function getProposal(bytes32 proposalHash) external view
  returns (Proposals.ProposalOutput memory ret) {
    Indices.Index memory index = _proposalIndices[proposalHash];
    require(index.exists, "ExeDAO: Proposal not found");
    Proposals.Proposal memory proposal = _proposals[index.index];
    ret = Proposals.ProposalOutput(
      proposalHash, _proposalMetaHashes[proposalHash],
      proposal.votes, proposal.expiryBlock, index.index
    );
  }
}