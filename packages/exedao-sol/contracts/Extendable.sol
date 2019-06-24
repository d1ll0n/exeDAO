pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "./lib/ExeLib.sol";
import "./Permissioned.sol";

contract Extendable is Permissioned {
  using ExeLib for address;
  using ExeLib for bytes;
  ExeLib.Extension[] public extensions;
  mapping(bytes4 => uint256) public extensionFor;

  event ExtensionAdded(uint256 extensionIndex, bytes32 metaHash);

  constructor(
    uint64 shares, uint64 _proposalDuration,
    bytes4[] memory funcSigs, uint8[] memory requirements
  ) public payable Permissioned(shares, _proposalDuration, funcSigs, requirements) {}

  function () external payable {
    ExeLib.Extension memory extension = extensions[extensionFor[msg.sig]];
    if (extension.extensionAddress != address(0) && voteAndContinue()) {
      if (extension.useDelegate) extension.extensionAddress.delegateExecute();
      else extension.extensionAddress.doCall();
    }
  }

  function getExtensions() external view
  returns(ExeLib.Extension[] memory) { return extensions; }

  function addExtension(ExeLib.Extension memory extension) public {
    if (extension.useDelegate) require(
      extension.bytecode.length > 0 && extension.bytecode.isPermissible(),
      "Bytecode not allowed"
    );
    if (voteAndContinue()) {
      if (extension.useDelegate) {
        extension.extensionAddress = extension.bytecode.deploy();
        delete extension.bytecode;
      }
      uint256 index = extensions.length;
      extensions.push(extension);
      bytes4[] memory funcSigs = extension.functionSignatures;
      for (uint256 i = 0; i < funcSigs.length; i++) extensionFor[funcSigs[i]] = index;
      emit ExtensionAdded(index, extension.metaHash);
    }
  }

  function removeExtension(uint256 extIndex) external {
    if (voteAndContinue()) {
      ExeLib.Extension memory ext = extensions[extIndex];
      for (uint256 i = 0; i < ext.functionSignatures.length; i++) {
        bytes4 funcSig = ext.functionSignatures[i];
        delete extensionFor[funcSig];
        if (approvalRequirements[funcSig] != 0) delete approvalRequirements[funcSig];
      }
      delete extensions[extIndex];
    }
  }
}
