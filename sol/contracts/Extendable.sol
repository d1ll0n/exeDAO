pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "./ExeLib.sol";
import "./Permissioned.sol";

contract Extendable is Permissioned {
  using ExeLib for address;
  using ExeLib for bytes;
  ExeLib.Function[] public functions;
  mapping(bytes4 => uint) public functionIndices;

  constructor(
    uint64 shares, bytes4[] memory funcSigs,
    uint8[] memory requirements, uint32 _proposalDuration
  ) public payable Permissioned(shares, funcSigs, requirements, _proposalDuration) {}

  function addFunctions(
    address functionAddress, bool[] calldata isCall,
    bytes4[] calldata funcSigs
  ) external {
    require(functionAddress.bytecodeAt().isPermissible(true), "Bytecode not allowed");
    require(funcSigs.length == isCall.length, "Inconsistent input");
    if (!voteAndContinue()) return;
    uint index = functions.length;
    for (uint i = 0; i < funcSigs.length; i++) {
      functions[++index] = ExeLib.Function({
        functionAddress: functionAddress,
        call: isCall[i]
      });
      functionIndices[funcSigs[i]] = index;
    }
  }

  function removeFunction(bytes4[] calldata funcSigs) external {
    for (uint i = 0; i < funcSigs.length; i++) {
      if (!voteAndContinue()) return;
      uint index = functionIndices[funcSigs[i]];
      delete functions[index];
      delete functionIndices[funcSigs[i]];
    }
  }

  function () external payable {
    address funcAddress = functions[functionIndices[msg.sig]].functionAddress;
    if (funcAddress != address(0) && voteAndContinue()) funcAddress.delegateExecute();
  }
}