pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "../lib/DaoLib.sol";
import "../lib/Indices.sol";

contract ExeDAOStorage {
  uint256 internal _minimumTribute;
  Indices.Index internal _lastExpiredApplication;
  DaoLib.Application[] internal _applications;
  mapping(address => Indices.Index) internal _applicationIndices;

  function getMinimumTribute() external view returns (uint256 minimum) {
    minimum = _minimumTribute;
  }

  function getApplication(address applicant) external view
  returns (DaoLib.Application memory application) {
    Indices.Index memory index = _applicationIndices[applicant];
    require(index.exists, "ExeDAO: Application not found");
    return _applications[index.index];
  }

  function getOpenApplications() external view
  returns (DaoLib.Application[] memory applications) {
    Indices.Index memory lastExpired = _lastExpiredApplication;
    uint256 startIndex = lastExpired.exists ? lastExpired.index + 1 : 0;
    uint256 size = _applications.length - startIndex;
    applications = new DaoLib.Application[](size);
    for (uint256 i = 0; i < size; i++) {
      uint256 index = startIndex + i;
      applications[i] = _applications[index];
    }
  }
}