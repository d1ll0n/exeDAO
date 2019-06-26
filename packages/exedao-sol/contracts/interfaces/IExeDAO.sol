pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "../lib/DaoLib.sol";
import "./IExtendable.sol";

contract IExeDAO is IExtendable {
  function getBuyRequest(address applicant) external view returns (DaoLib.BuyRequest memory buyRequest);
  function getOpenBuyRequests() external view returns (DaoLib.BuyRequest[] memory buyRequests);
  function getBuyRequestMinimum() external view returns (uint256 minimum);
  function setBuyRequestMinimum(uint256 minimum) external;
  function safeExecute(bytes calldata bytecode) external;
  function requestShares(bytes32 metaHash, uint64 shares, DaoLib.TokenValue[] calldata tokenTributes) external payable;
  function executeBuyRequest(address applicant) external;
}