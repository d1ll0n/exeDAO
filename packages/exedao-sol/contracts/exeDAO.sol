pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "./Extendable.sol";

contract exeDAO is Extendable {
  constructor(
    uint64 shares, uint64 _proposalDuration,
    bytes4[] memory funcSigs, uint8[] memory requirements
  ) public payable Extendable(shares, _proposalDuration, funcSigs, requirements) {}

  uint256 minimumRequestValue;
  mapping(address => DaoLib.BuyRequest) public buyRequests;

  function setMinimumRequestValue(uint256 value) external {
    if (voteAndContinue()) minimumRequestValue = value;
  }

  function safeExecute(bytes calldata bytecode) external {
    require(bytecode.isPermissible(), "Bytecode not allowed");
    if (voteAndContinue()) bytecode.delegateExecute();
  }

  /** @dev Lock some eth and make a request to buy shares. */
  function requestShares(bytes32 metaHash, uint64 shares) external payable {
    require(buyRequests[msg.sender].lockedwei == 0, "Buy request pending");
    require(shares > 0, "Can not request 0 shares");
    buyRequests[msg.sender] = DaoLib.BuyRequest({
      metaHash: metaHash,
      lockedwei: msg.value,
      amount: shares
    });
  }

  /**
   * @dev For buyer, cancel the offer and reclaim wei if a proposal has not been
   * started by a daoist or has expired. For daoists, vote to accept the offer.
  */
  function executeBuyOffer(address applicant) external {
    DaoLib.BuyRequest memory request = buyRequests[applicant];
    require(request.lockedwei > 0, "No buy offer");
    if (msg.sender == applicant) {
      require(
        block.number >= proposals[proposalIndices[keccak256(msg.data)]].expiryBlock,
        "Must wait for proposal to finish"
      );
      delete buyRequests[applicant];
      msg.sender.transfer(request.lockedwei);
    }
    else if (voteAndContinue()) {
      delete buyRequests[applicant];
      _mintShares(applicant, request.amount);
    }
  }
}