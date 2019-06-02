pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "./Extendable.sol";

contract exeDAO is Extendable {

  constructor(
    uint64 shares, bytes4[] memory funcSigs,
    uint8[] memory requirements, uint32 _proposalDuration
  ) public payable Extendable(shares, funcSigs, requirements, _proposalDuration) {}

  function safeExecute(bytes calldata bytecode) external {
    require(bytecode.isPermissible(false), "Bytecode not allowed");
    if (voteAndContinue()) bytecode.delegateExecute();
  }

  function unsafeExecute(bytes calldata bytecode) external {
    if (voteAndContinue()) bytecode.delegateExecute();
  }
}