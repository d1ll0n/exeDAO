pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "../lib/DaoLib.sol";
import "./IExtendable.sol";

contract IExeDAO is IExtendable {
  function getApplication(address applicant) external view returns (DaoLib.Application memory application);
  function getOpenApplications() external view returns (DaoLib.Application[] memory applications);
  function getMinimumTribute() external view returns (uint256 minimum);
  function setMinimumTribute(uint256 minimum) external;
  function safeExecute(bytes calldata bytecode) external;
  function submitApplication(bytes32 metaHash, uint64 shares, DaoLib.TokenValue[] calldata tokenTributes) external payable;
  function executeApplication(address applicant) external;
}