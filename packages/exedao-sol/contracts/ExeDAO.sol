pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "./Extendable.sol";
import "./storage/ExeDAOStorage.sol";
import "./interfaces/IExeDAO.sol";

contract ExeDAO is IExeDAO, Extendable, ExeDAOStorage {
  event BuyRequestAdded(address applicant, uint64 shares);
  event BuyRequestCancelled(address applicant);

  constructor(
    uint64 shares, uint64 _proposalDuration,
    bytes4[] memory funcSigs, uint8[] memory requirements
  ) public payable Extendable(shares, _proposalDuration, funcSigs, requirements) {}

  function setBuyRequestMinimum(uint256 minimum) external {
    if (_voteAndContinue()) _minimumRequestValue = minimum;
  }

  function safeExecute(bytes calldata bytecode) external {
    require(bytecode.isPermissible(), "ExeDAO: Bytecode not allowed");
    if (_voteAndContinue()) bytecode.delegateExecute();
  }

  /**
   * @dev Lock some eth and make a request to buy shares.
   */
  function requestShares(bytes32 metaHash, uint64 shares, DaoLib.TokenValue[] calldata tokenTributes) external payable {
    require(!_daoistIndices[msg.sender].exists, "ExeDAO: Already a daoist");
    Indices.Index memory index = _buyRequestIndices[msg.sender];
    require(!index.exists, "ExeDAO: Buy request pending");
    require(shares > 0, "ExeDAO: Can not request 0 shares");
    require(msg.value >= _minimumRequestValue, "ExeDAO: Insufficient payment for buy request");
    uint256 tokenCount = tokenTributes.length;
    address[] memory lockedTokens = new address[](tokenCount);
    uint256[] memory lockedTokenValues = new uint256[](tokenCount);
    for (uint256 i = 0; i < tokenCount; i++) {
      DaoLib.TokenValue memory tokenTribute = tokenTributes[i];
      _receiveToken(tokenTribute.tokenAddress, msg.sender, tokenTribute.value);
      lockedTokens[i] = tokenTribute.tokenAddress;
      lockedTokenValues[i] = tokenTribute.value;
    }
    DaoLib.BuyRequest memory buyRequest = DaoLib.BuyRequest({
      applicant: msg.sender,
      metaHash: metaHash,
      lockedWei: msg.value,
      lockedTokens: lockedTokens,
      lockedTokenValues: lockedTokenValues,
      shares: shares
    });
    index = Indices.Index(true, uint248(_buyRequests.length));
    _buyRequestIndices[msg.sender] = index;
    _buyRequests.push(buyRequest);
    emit BuyRequestAdded(msg.sender, shares);
    /* for (uint256 i = 0; i < tokenTributes.length; i++) {
      _buyRequests[index.index].lockedTokens.push(tokenTributes[i]);
    } */
  }

  /**
   * @dev For buyer, cancel the offer and reclaim wei if a proposal has not been
   * started by a daoist or has expired. For daoists, vote to accept the offer.
   */
  function executeBuyRequest(address applicant) external {
    Indices.Index memory index = _buyRequestIndices[msg.sender];
    require(index.exists, "ExeDAO: Buy request not found");
    DaoLib.BuyRequest memory request = _buyRequests[index.index];
    if (msg.sender == applicant) {
      Indices.Index memory proposalIndex = _proposalIndices[keccak256(msg.data)];
      if (proposalIndex.exists) {
        require(
          block.number >= _proposals[index.index].expiryBlock,
          "ExeDAO: Must wait for proposal to finish"
        );
        if (index.index > _lastExpiredBuyRequest) _lastExpiredBuyRequest = index.index;
      }
      delete _buyRequests[index.index];
      delete _buyRequestIndices[applicant];
      emit BuyRequestCancelled(applicant);
      msg.sender.transfer(request.lockedWei);
      for (uint256 i = 0; i < request.lockedTokens.length; i++) {
        _transferToken(request.lockedTokens[i], msg.sender, request.lockedTokenValues[i]);
      }
    }
    else if (_voteAndContinue()) {
      delete _buyRequests[index.index];
      delete _buyRequestIndices[applicant];
      _mintShares(applicant, request.shares);
    }
  }
}