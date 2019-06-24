pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "./lib/SafeMath.sol";
import "./lib/IERC20.sol";
import "./lib/DaoLib.sol";

/**
 * @title Shared
 * @author Dillon Kellar, Raymond Pulver
 * @notice Keeps track of who owns shares in a DAO and provides a method for burning shares in exchange for ether owned by the contract.
 * @dev Does not expose any external methods for giving shares, must be handled by child
 */
contract Shared {
  using SafeMath for uint256;
  using SafeMath for uint64;

  uint256 multiplier = 2 finney;
  uint64 public totalShares;
  mapping(address => uint64) public daoists;
  address[] public tokens;
  mapping(address => uint256) public tokenIndices;

  constructor(uint64 shares) public payable {
    _mintShares(msg.sender, shares);
  }

  event SharesBurned(address indexed daoist, uint64 shares);
  event SharesMinted(address indexed daoist, uint64 shares);
  event TokenAdded(address indexed tokenAddress);
  event TokenTransferred(address indexed tokenAddress, address indexed recipient, uint256 amount);
  event TokenReceived(address indexed tokenAddress, address indexed sender, uint256 amount);

  function getShares() internal view returns (uint64 shares) {
    shares = daoists[msg.sender];
    require(shares > 0, "Not a daoist.");
  }

  function burnShares(uint64 amount) external
  returns(uint256 weiValue, DaoLib.TokenValue[] memory tokenValues) {
    uint64 shares = getShares();
    require(shares >= amount, "Not enough shares");
    daoists[msg.sender] = uint64(shares.sub(amount)); // subtract shares prior to sending anything
    uint256 relativeShare = multiplier.mul(amount).div(totalShares); // use large multiplier to avoid rounding errors
    uint numTokens = tokens.length;
    tokenValues = new DaoLib.TokenValue[](numTokens);
    uint256 balance;
    uint256 shareValue;
    address tokenAddress;
    for (uint i = 0; i < numTokens; i++) {
      tokenAddress = tokens[i];
      balance = IERC20(tokenAddress).balanceOf(address(this));
      shareValue = relativeShare.mul(balance).div(multiplier);
      _transferToken(tokenAddress, msg.sender, shareValue);
      tokenValues[i] = DaoLib.TokenValue(tokenAddress, shareValue);
    }
    weiValue = address(this).balance.mul(relativeShare).div(multiplier);
    msg.sender.transfer(weiValue);
    emit SharesBurned(msg.sender, amount);
  }

  function _mintShares(address recipient, uint64 amount) internal {
    daoists[recipient] = uint64(daoists[recipient].add(amount));
    totalShares = uint64(totalShares.add(amount));
    emit SharesMinted(recipient, amount);
  }

  function _addToken(address tokenAddress) internal {
    require(tokens[tokenIndices[tokenAddress]] == address(0), "exeDAO: Token already added");
    tokenIndices[tokenAddress] = tokens.length;
    tokens.push(tokenAddress);
    emit TokenAdded(tokenAddress);
  }

  function _transferToken(address tokenAddress, address recipient, uint256 amount) internal {
    require(tokens[tokenIndices[tokenAddress]] != address(0), "exeDAO: Token not supported");
    require(IERC20(tokenAddress).transfer(recipient, amount), "exeDAO: transferFrom failed.");
    emit TokenTransferred(tokenAddress, recipient, amount);
  }

  function _receiveToken(address tokenAddress, address sender, uint256 amount) public {
    require(tokens[tokenIndices[tokenAddress]] != address(0), "exeDAO: Token not supported");
    require(IERC20(tokenAddress).transferFrom(sender, address(this), amount), "exeDAO: transferFrom failed.");
    emit TokenReceived(tokenAddress, sender, amount);
  }
}