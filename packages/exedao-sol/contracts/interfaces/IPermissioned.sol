pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "../lib/Proposals.sol";
import "./IBaseDAO.sol";

contract IPermissioned is IBaseDAO {
  function getApprovalRequirement(bytes4 funcSig) external view returns (uint8 requirement);
  function getApprovalRequirements(bytes4[] calldata funcSigs) external view returns (uint8[] memory requirements);
  function getOpenProposals() external view returns (Proposals.ProposalOutput[] memory proposals);
  function getProposal(bytes32 proposalHash) external view returns (Proposals.ProposalOutput memory ret);
  function setProposalDuration(uint64 duration) external;
  function mintShares(address recipient, uint64 amount) external;
  function setApprovalRequirement(bytes4 funcSig, uint8 approvalRequirement) external;
  function submitOrVote(bytes32 proposalHash) external returns(uint, uint);
  function submitWithMetaHash(bytes32 proposalHash, bytes32 metaHash) external returns(uint256 index);
  function closeProposal(bytes32 proposalHash) external;
  function supplyOfflineVotesWithCall(
    bytes calldata wrappedCalldata,
    bytes[] calldata sigs,
    uint256[] calldata nonces,
    bytes32[] calldata proposalHashes
  ) external returns (bytes memory);
  function addToken(address tokenAddress) external;
  function approveTokenTransfer(address tokenAddress, address spender, uint256 amount) external;
  function transferToken(address tokenAddress, address recipient, uint256 amount) external;
  function receiveToken(address tokenAddress, address sender, uint256 amount) external;
}