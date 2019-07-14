pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2; 

import "./lib/ExeLib.sol";
import "./Permissioned.sol";
import "./storage/ExtendableStorage.sol";
import "./interfaces/IExtendable.sol";

contract Extendable is IExtendable, Permissioned, ExtendableStorage {
  event ExtensionAdded(uint256 extensionIndex, bytes32 metaHash);

  constructor(
    uint64 shares, uint64 _proposalDuration,
    bytes4[] memory funcSigs, uint8[] memory requirements
  ) public payable Permissioned(shares, _proposalDuration, funcSigs, requirements) {}

  function () external payable {
    Indices.Index memory index = _extensionFor[msg.sig];
    if (index.exists) {
      if (_voteAndContinue()) {
        ExeLib.Extension memory extension = _extensions[index.index];
        if (extension.useDelegate) extension.extensionAddress.delegateExecute();
        else extension.extensionAddress.doCall();
      }
    }
  }

  function removeExtension(uint256 extIndex) external {
    if (_voteAndContinue()) {
      ExeLib.Extension memory ext = _extensions[extIndex];
      for (uint256 i = 0; i < ext.functionSignatures.length; i++) {
        bytes4 funcSig = ext.functionSignatures[i];
        delete _extensionFor[funcSig];
        if (_approvalRequirements[funcSig] != 0) delete _approvalRequirements[funcSig];
      }
      delete _extensions[extIndex];
    }
  }

  function addExtension(ExeLib.Extension memory extension) public {
    if (extension.useDelegate) require(
      extension.bytecode.length > 0 && extension.bytecode.isPermissible(),
      "ExeDAO: Bytecode not allowed"
    );
    if (_voteAndContinue()) {
      if (extension.useDelegate) {
        extension.extensionAddress = extension.bytecode.deploy();
        delete extension.bytecode;
      }
      uint256 index = _extensions.length;
      _extensions.push(extension);
      bytes4[] memory funcSigs = extension.functionSignatures;
      for (uint256 i = 0; i < funcSigs.length; i++) {
        require(!_extensionFor[funcSigs[i]].exists, "ExeDAO: Approval already set");
        _extensionFor[funcSigs[i]] = Indices.Index(true, uint248(index));
      }
      emit ExtensionAdded(index, extension.metaHash);
    }
  }
}
