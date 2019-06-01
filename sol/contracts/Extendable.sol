pragma solidity ^0.5.6;
pragma experimental ABIEncoderV2;

import "./ExeLib.sol";
import "./Permissioned.sol";

contract Extendable is Permissioned {
  using ExeLib for address;
  using ExeLib for bytes;
  mapping(bytes4 => ExeLib.Function) public functions;

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

  function () external payable {
    address functionAddress = functions[msg.sig].functionAddress;
    if (functionAddress != address(0)) {
      if (!voteAndContinue()) return;
      functionAddress.delegateExecute();
    }
  }
}