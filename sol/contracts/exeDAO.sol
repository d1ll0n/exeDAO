pragma solidity ^0.5.6;
pragma experimental ABIEncoderV2;

import "./ExeLib.sol";
import "./Permissioned.sol";

contract exeDAO is Permissioned {
  using ExeLib for bytes;

  function safeExecute(bytes calldata bytecode) external {
    require(bytecode.isPermissible(), "Bytecode not allowed");
    if (!voteAndContinue()) return;
    bytecode.delegateExecute();
  }

  function unsafeExecute(bytes calldata bytecode) external {
    if (!voteAndContinue()) return;
    bytecode.delegateExecute();
  }

  function mintShares(address recipient, uint64 amount) external {
    if (!voteAndContinue()) return;
    _mintShares(recipient, amount);
  }

  function () external payable {}
}