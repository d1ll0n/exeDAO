pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2; 

import "./storage/BaseDAOStorage.sol";
import "./interfaces/IBaseDAO.sol";

/**
 * @title BaseDAO
 * @author Dillon Kellar, Raymond Pulver
 * @notice Keeps track of who owns shares in a DAO and provides a method for burning shares in exchange for ether owned by the contract.
 * @dev Does not expose any external methods for giving shares, must be handled by child
 */
contract BaseDAO is IBaseDAO, BaseDAOStorage {
  event SharesBurned(address indexed daoist, uint64 shares);
  event SharesMinted(address indexed daoist, uint64 shares);
  event TokenAdded(address indexed tokenAddress);
  event TokenRemoved(address indexed tokenAddress);
  event TokenTransferred(address indexed tokenAddress, address indexed recipient, uint256 amount);
  event TokenReceived(address indexed tokenAddress, address indexed sender, uint256 amount);


  constructor(uint64 shares) public payable {
    _mintShares(msg.sender, shares);
  }

  /**
   * @dev Returns the number of shares owned by the sender. Reverts if the user has no shares.
   */
  function _getShares() internal view returns (uint64 shares) {
    shares = getDaoist(msg.sender).shares;
    require(shares > 0, "ExeDAO: Not a daoist");
  }

  function burnShares(uint64 amount) external
  returns(uint256 weiValue, DaoLib.TokenValue[] memory tokenBurnValues) {
    DaoLib.DaoistOutput memory _daoist = getDaoist(msg.sender);
    require(_daoist.shares >= amount, "ExeDAO: Not enough shares");
    // use large multiplier to avoid rounding errors
    uint256 relativeShare = _multiplier.mul(amount).div(_totalShares);
    // subtract shares prior to sending anything to prevent reentrance
    _daoists[_daoist.index].shares = uint64(_daoist.shares.sub(amount));
    _totalShares = uint64(_totalShares.sub(amount));
    uint256 numTokens = _tokens.length;
    tokenBurnValues = new DaoLib.TokenValue[](numTokens);
    uint256 shareValue;
    uint256 balance;
    for (uint256 i = 0; i < numTokens; i++) {
      IERC20 token = _tokens[i];
      balance = token.balanceOf(address(this));
      shareValue = relativeShare.mul(balance).div(_multiplier);
      token.transfer(msg.sender, shareValue);
      tokenBurnValues[i] = DaoLib.TokenValue(address(token), shareValue);
    }
    weiValue = address(this).balance.mul(relativeShare).div(_multiplier);
    msg.sender.transfer(weiValue);
    emit SharesBurned(msg.sender, amount);
  }

  function _mintShares(address recipient, uint64 amount) internal {
    Indices.Index memory index = _daoistIndices[recipient];
    if (!index.exists) {
      _daoistIndices[recipient] = Indices.Index(true, uint248(_daoists.length));
      _daoists.push(DaoLib.Daoist(recipient, amount));
    } else {
      _daoists[index.index].shares = uint64(_daoists[index.index].shares.add(amount));
    }
    _totalShares = uint64(_totalShares.add(amount));
    emit SharesMinted(recipient, amount);
  }

  function _addToken(address tokenAddress) internal {
    Indices.Index memory index = _tokenIndices[tokenAddress];
    require(!index.exists, "ExeDAO: Token exists");
    _tokenIndices[tokenAddress] = Indices.Index(true, uint248(_tokens.length));
    _tokens.push(IERC20(tokenAddress));
    emit TokenAdded(tokenAddress);
  }

  function _removeToken(address tokenAddress) internal {
    Indices.Index memory index = _tokenIndices[tokenAddress];
    require(index.exists, "ExeDAO: Token not found");
    delete _tokenIndices[tokenAddress];
    delete _tokens[index.index];
    emit TokenRemoved(tokenAddress);
  }

  function _approveTokenTransfer(address tokenAddress, address spender, uint256 amount) internal {
    IERC20 token = _getToken(tokenAddress);
    require(token.approve(spender, amount), "ExeDAO: Approve transfer failed");
  }

  function _receiveToken(address tokenAddress, address sender, uint256 amount) internal {
    IERC20 token = _getToken(tokenAddress);
    require(token.transferFrom(sender, address(this), amount), "ExeDAO: transferFrom failed.");
    emit TokenReceived(tokenAddress, sender, amount);
  }

  function _transferToken(address tokenAddress, address recipient, uint256 amount) internal {
    IERC20 token = _getToken(tokenAddress);
    require(token.transfer(recipient, amount), "ExeDAO: Transfer failed");
    emit TokenTransferred(tokenAddress, recipient, amount);
  }
}