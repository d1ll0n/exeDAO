pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "./Extendable.sol";
import "./storage/ExeDAOStorage.sol";
import "./interfaces/IExeDAO.sol";

contract ExeDAO is IExeDAO, Extendable, ExeDAOStorage {
  event ApplicationAdded(address applicant, uint64 shares);
  event ApplicationCanceled(address applicant);

  constructor(
    uint64 shares, uint64 _proposalDuration,
    bytes4[] memory funcSigs, uint8[] memory requirements
  ) public payable Extendable(shares, _proposalDuration, funcSigs, requirements) {}

  function setMinimumTribute(uint256 minimum) external {
    if (_voteAndContinue()) _minimumTribute = minimum;
  }

  function safeExecute(bytes calldata bytecode) external {
    require(bytecode.isPermissible(), "ExeDAO: Bytecode not allowed");
    if (_voteAndContinue()) bytecode.delegateExecute();
  }

  /**
   * @dev Apply to join the DAO and lock some wei/tokens.
   */
  function submitApplication(bytes32 metaHash, uint64 shares, DaoLib.TokenValue[] calldata tokenTributes) external payable {
    require(!_daoistIndices[msg.sender].exists, "ExeDAO: Already a daoist");
    Indices.Index memory index = _applicationIndices[msg.sender];
    require(!index.exists, "ExeDAO: Application pending");
    require(shares > 0 && msg.value >= _minimumTribute, "ExeDAO: Bad application");
    uint256 tokenCount = tokenTributes.length;
    address[] memory lockedTokens = new address[](tokenCount);
    uint256[] memory lockedTokenValues = new uint256[](tokenCount);
    for (uint256 i = 0; i < tokenCount; i++) {
      DaoLib.TokenValue memory tokenTribute = tokenTributes[i];
      _receiveToken(tokenTribute.tokenAddress, msg.sender, tokenTribute.value);
      lockedTokens[i] = tokenTribute.tokenAddress;
      lockedTokenValues[i] = tokenTribute.value;
    }
    DaoLib.Application memory application = DaoLib.Application(metaHash, msg.value, msg.sender, lockedTokens, lockedTokenValues, shares);
    index = Indices.Index(true, uint248(_applications.length));
    _applicationIndices[msg.sender] = index;
    _applications.push(application);
    emit ApplicationAdded(msg.sender, shares);
  }

  /**
   * @dev For buyer, cancel the offer and reclaim wei if a proposal has not been
   * started by a daoist or has expired. For daoists, vote to accept the offer. 
   */
  function executeApplication(address applicant) external {
    Indices.Index memory index = _applicationIndices[applicant];
    require(index.exists, "ExeDAO: Application not found");
    DaoLib.Application memory application = _applications[index.index];
    if (msg.sender == applicant) {
      Indices.Index memory proposalIndex = _proposalIndices[keccak256(msg.data)];
      if (proposalIndex.exists) {
        require(
          block.number >= _proposals[index.index].expiryBlock,
          "ExeDAO: Must wait for proposal to finish"
        );
        if (index.index > _lastExpiredApplication.index) _lastExpiredApplication = index;
      }
      delete _applications[index.index];
      delete _applicationIndices[applicant];
      emit ApplicationCanceled(applicant);
      msg.sender.transfer(application.weiTribute);
      for (uint256 i = 0; i < application.tokenTributes.length; i++) {
        _transferToken(application.tokenTributes[i], msg.sender, application.tokenTributeValues[i]);
      }
    }
    else if (_voteAndContinue()) {
      delete _applications[index.index];
      delete _applicationIndices[applicant];
      _mintShares(applicant, application.shares);
    }
  }
}