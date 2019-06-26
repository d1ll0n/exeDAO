pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "./Extendable.sol";
import "./storage/ExeDAOStorage.sol";
import "./interfaces/IExeDAO.sol";

contract ExeDAO is IExeDAO, Extendable, ExeDAOStorage {
  constructor(
    uint64 shares, uint64 _proposalDuration,
    bytes4[] memory funcSigs, uint8[] memory requirements
  ) public payable Extendable(shares, _proposalDuration, funcSigs, requirements) {}

  function setMinimumRequestValue(uint256 value) external {
    if (_voteAndContinue()) _minimumRequestValue = value;
  }

  function safeExecute(bytes calldata bytecode) external {
    require(bytecode.isPermissible(), "Bytecode not allowed");
    if (_voteAndContinue()) bytecode.delegateExecute();
  }

  /**
   * @dev Lock some eth and make a request to buy shares.
   */
  function requestShares(bytes32 metaHash, uint64 shares) external payable {
    require(_buyRequests[msg.sender].lockedwei == 0, "Buy request pending");
    require(shares > 0, "Can not request 0 shares");
    _buyRequests[msg.sender] = DaoLib.BuyRequest({
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
    DaoLib.BuyRequest memory request = _buyRequests[applicant];
    require(request.lockedwei > 0, "No buy offer");
    if (msg.sender == applicant) {
      Indices.Index memory index = _proposalIndices[keccak256(msg.data)];
      require(
        block.number >= _proposals[index.index].expiryBlock,
        "Must wait for proposal to finish"
      );
      delete _buyRequests[applicant];
      msg.sender.transfer(request.lockedwei);
    }
    else if (_voteAndContinue()) {
      delete _buyRequests[applicant];
      _mintShares(applicant, request.amount);
    }
  }
}