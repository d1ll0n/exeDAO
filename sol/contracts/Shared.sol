pragma solidity ^0.5.5;

import "./SafeMath.sol";

contract Shared {
  using SafeMath for uint;
  using SafeMath for uint32;

  uint32 public totalShares;
  mapping(address => uint32) public daoists;

  constructor(uint32 shares) public payable {
    _mintShares(msg.sender, shares);
  }

  event SharesBurned(address indexed daoist, uint32 shares, uint value);
  event SharesMinted(address indexed daoist, uint32 shares);

  function getShares() internal view returns (uint32 shares) {
    shares = daoists[msg.sender];
    require(shares > 0, "Not a daoist.");
  }

  function burnShares(uint32 amount) external {
    uint shares = getShares();
    require(shares >= amount, "Not enough shares");
    daoists[msg.sender] = uint32(shares.sub(amount));
    uint value = address(this).balance.mul(amount).div(totalShares);
    msg.sender.transfer(value);
    emit SharesBurned(msg.sender, amount, value);
  }

  function _mintShares(address recipient, uint32 amount) internal {
    daoists[recipient] = uint32(daoists[recipient].add(amount));
    totalShares = uint32(totalShares.add(amount));
    emit SharesMinted(recipient, amount);
  }
}