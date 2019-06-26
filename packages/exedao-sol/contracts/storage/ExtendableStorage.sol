pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "../lib/ExeLib.sol";
import "../lib/Indices.sol";

/**
 * @title ExtendableStorage
 * @author Dillon Kellar, Raymond Pulver
 * @dev Storage and getters for Extendable.sol
 * @notice Makes the contract less cluttered by separating getters and storage setup into a separate contract.
 */
contract ExtendableStorage {
  using ExeLib for address;
  using ExeLib for bytes;

  ExeLib.Extension[] internal _extensions;
  mapping(bytes4 => Indices.Index) internal _extensionFor;

  function getExtensions() external view
  returns (ExeLib.Extension[] memory) { return _extensions; }

  function extensionFor(bytes4 funcSig) external view
  returns (ExeLib.Extension memory extension) {
    Indices.Index memory index = _extensionFor[funcSig];
    require(index.exists, "ExeDAO: Extension not found");
    return _extensions[index.index];
  }
}