pragma solidity ^0.5.6;
pragma experimental ABIEncoderV2;

import "./ExeLib.sol";
import "./Permissioned.sol";

contract exeDAO is Permissioned {
  using ExeLib for address;
  using ExeLib for bytes;
  mapping(bytes4 => ExeLib.Function) public functions;

  constructor(uint64 shares, bytes4[] memory funcSigs, uint8[] memory requirements) public payable {
    require(funcSigs.length == requirements.length);
    for (uint i = 0; i < funcSigs.length; i++) {
      DaoLib.ProposalRequirement req = DaoLib.ProposalRequirement(requirements[i]);
      require(req != DaoLib.ProposalRequirement.Default);
      proposalRequirements[funcSigs[i]] = req;
    }
    _mintShares(msg.sender, shares);
  }

  function safeExecute(bytes calldata bytecode) external {
    require(bytecode.isPermissible(false), "Bytecode not allowed");
    if (!voteAndContinue()) return;
    bytecode.delegateExecute();
  }

  function unsafeExecute(bytes calldata bytecode) external {
    if (!voteAndContinue()) return;
    bytecode.delegateExecute();
  }

  function addFunctions(
    address functionAddress, bool[] calldata isCall,
    bytes4[] calldata funcSigs
  ) external {
    require(functionAddress.bytecodeAt().isPermissible(true), "Bytecode not allowed");
    require(funcSigs.length == isCall.length, "Inconsistent input");
    if (!voteAndContinue()) return;
    for (uint i = 0; i < funcSigs.length; i++) {
      functions[funcSigs[i]] = ExeLib.Function({
        functionAddress: functionAddress,
        call: isCall[i]
      });
    }
  }

  function removeFunction(bytes4[] calldata funcSigs) external {
    for (uint i = 0; i < funcSigs.length; i++) {
      if (!voteAndContinue()) return;
      functions[funcSigs[i]].functionAddress = address(0);
    }
  }

  function mintShares(address recipient, uint64 amount) external {
    if (!voteAndContinue()) return;
    _mintShares(recipient, amount);
  }

  function () external payable {
    address functionAddress = functions[msg.sig].functionAddress;
    if (functionAddress != address(0)) {
      if (!voteAndContinue()) return;
      functionAddress.delegateExecute();
    }
  }
}