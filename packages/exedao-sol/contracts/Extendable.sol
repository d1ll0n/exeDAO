pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "./ExeLib.sol";
import "./Permissioned.sol";

contract Extendable is Permissioned {
  using ExeLib for address;
  using ExeLib for bytes;
  using ExeLib for string;
  ExeLib.Extension[] public extensions;
  mapping(bytes4 => uint) public extensionFor;

  constructor(
    uint32 shares, uint32 _proposalDuration,
    bytes4[] memory funcSigs, uint8[] memory requirements
  ) public payable Permissioned(shares, _proposalDuration, funcSigs, requirements) {}

  function () external payable {
    ExeLib.Extension memory extension = extensions[extensionFor[msg.sig]];
    if (extension.extensionAddress != address(0) && voteAndContinue()) {
      if (extension.useDelegate) extension.extensionAddress.delegateExecute();
      else extension.extensionAddress.doCall();
    }
  }

  function getExtensions() external view returns(ExeLib.Extension[] memory ret) {
    return extensions;
  }

  function getExtension(uint index) external view
  returns(ExeLib.Extension memory ret) {
    ret = extensions[index];
  }

  function addExtension(
    address extensionAddress, bool useDelegate,
    string[] memory rawFunctions
  ) public {
    if (voteAndContinue()) {
      if (useDelegate) require(extensionAddress.bytecodeAt().isPermissible(true), "Bytecde not allowed");
      extensions.push(ExeLib.Extension({
        extensionAddress: extensionAddress,
        useDelegate: useDelegate,
        rawFunctions: rawFunctions
      }));
      for (uint i = 0; i < rawFunctions.length; i++) {
        extensionFor[rawFunctions[i].signatureOf()] = extensions.length - 1;
      }
    }
  }

  function removeExtension(uint extIndex) external {
    if (voteAndContinue()) {
      ExeLib.Extension memory ext = extensions[extIndex];
      for (uint i = 0; i < ext.rawFunctions.length; i++) {
        bytes4 funcSig = ext.rawFunctions[i].signatureOf();
        delete extensionFor[funcSig];
        if (proposalRequirements[funcSig] != 0) delete proposalRequirements[funcSig];
      }
      delete extensions[extIndex];
    }
  }
}