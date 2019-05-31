pragma solidity ^0.5.6;
pragma experimental ABIEncoderV2;

import "./ExeLib.sol";
import "./Permissioned.sol";

contract exeDAO is Permissioned {
  using ExeLib for bytes;
  mapping(bytes4 => address) public functions;

  constructor(uint64 shares, bytes4[] memory funcSigs, uint8[] memory requirements) public payable {
    require(funcSigs.length == requirements.length);
    for (uint i = 0; i < funcSigs.length; i++) {
      DaoLib.ProposalRequirement req = DaoLib.ProposalRequirement(requirements[i]);
      require(req != DaoLib.ProposalRequirement.Default);

    }

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

  function mintShares(address recipient, uint64 amount) external {
    if (!voteAndContinue()) return;
    _mintShares(recipient, amount);
  }

  function () external payable {

  }
}