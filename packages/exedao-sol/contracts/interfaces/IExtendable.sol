pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "../lib/ExeLib.sol";
import "./IPermissioned.sol";

contract IExtendable is IPermissioned {
  function getExtension(uint256 index) external view returns (ExeLib.Extension memory);
  function getExtensionFor(bytes4 funcSig) external view returns (ExeLib.Extension memory extension);
  function getExtensions() external view returns (ExeLib.Extension[] memory);
  function removeExtension(uint256 extIndex) external;
  function addExtension(ExeLib.Extension memory extension) public;
}