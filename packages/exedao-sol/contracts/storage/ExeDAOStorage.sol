pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "../lib/DaoLib.sol";

contract ExeDAOStorage {
  uint256 internal _minimumRequestValue;
  mapping(address => DaoLib.BuyRequest) internal _buyRequests;

  function getMinimumRequestValue() external view returns (uint256 minimumRequestValue) {
    return _minimumRequestValue;
  }

  function getBuyRequest(address applicant) external view
  returns (DaoLib.BuyRequest memory buyRequest) {
    return _buyRequests[applicant];
  }
}