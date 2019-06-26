pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "../lib/DaoLib.sol";
import "../lib/Indices.sol";

contract ExeDAOStorage {
  uint256 internal _minimumRequestValue;
  uint256 internal _lastExpiredBuyRequest;
  DaoLib.BuyRequest[] internal _buyRequests;
  mapping(address => Indices.Index) internal _buyRequestIndices;

  function getBuyRequestMinimum() external view returns (uint256 minimum) {
    minimum = _minimumRequestValue;
  }

  function getBuyRequest(address applicant) external view
  returns (DaoLib.BuyRequest memory buyRequest) {
    Indices.Index memory index = _buyRequestIndices[applicant];
    require(index.exists, "ExeDAO: Buy request not found");
    return _buyRequests[index.index];
  }

  function getOpenBuyRequests() external view
  returns (DaoLib.BuyRequest[] memory buyRequests) {
    uint256 size = _buyRequests.length - _lastExpiredBuyRequest - 1;
    buyRequests = new DaoLib.BuyRequest[](size);
    for (uint256 i = 0; i < size; i++) {
      uint256 index = _lastExpiredBuyRequest + i + 1;
      buyRequests[i] = _buyRequests[index];
    }
  }
}