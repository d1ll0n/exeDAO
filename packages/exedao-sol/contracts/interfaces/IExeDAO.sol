pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "../lib/DaoLib.sol";
import "./IExtendable.sol";

contract IExeDAO is IExtendable {
  function getMinimumRequestValue() external view returns (uint256 minimumRequestValue);
  function getBuyRequest(address applicant) external view returns (DaoLib.BuyRequest memory buyRequest);
  function setMinimumRequestValue(uint256 value) external;
  function safeExecute(bytes calldata bytecode) external;
  function requestShares(bytes32 metaHash, uint64 shares) external payable;
  function executeBuyOffer(address applicant) external;
}