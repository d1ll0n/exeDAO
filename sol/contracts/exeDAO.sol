pragma solidity ^0.5.6;
pragma experimental ABIEncoderV2;

import "./Extendable.sol";

contract exeDAO is Extendable {
  constructor(uint64 shares, bytes4[] memory funcSigs, uint8[] memory requirements) public payable {
    require(funcSigs.length == requirements.length);
    for (uint i = 0; i < funcSigs.length; i++) {
      DaoLib.ProposalRequirement req = DaoLib.ProposalRequirement(requirements[i]);
      require(req != DaoLib.ProposalRequirement.Default);
      proposalRequirements[funcSigs[i]] = req;
    }
    _mintShares(msg.sender, shares);
  }

  function mintShares(address recipient, uint64 amount) external {
    if (!voteAndContinue()) return;
    _mintShares(recipient, amount);
  }
}