pragma solidity ^0.5.5;

import "./SafeMath.sol";

contract Shared {
  using SafeMath for uint;
  using SafeMath for uint64;

  uint64 public totalShares;
  mapping(address => uint64) public daoists;

  constructor(uint64 shares) public payable {
    _mintShares(msg.sender, shares);
  }

  event SharesBurned(address indexed daoist, uint64 shares, uint value);
  event SharesMinted(address indexed daoist, uint64 shares);

  function getShares() internal view returns (uint64 shares) {
    shares = daoists[msg.sender];
    require(shares > 0, "Not a daoist.");
  }

  function burnShares(uint64 amount) external {
    uint shares = getShares();
    require(shares >= amount, "Not enough shares");
    daoists[msg.sender] = uint64(shares.sub(amount));
    uint value = address(this).balance.mul(amount).div(totalShares);
    msg.sender.transfer(value);
    emit SharesBurned(msg.sender, amount, value);
  }

  function _mintShares(address recipient, uint64 amount) internal {
    daoists[recipient] = uint64(daoists[recipient].add(amount));
    totalShares = uint64(totalShares.add(amount));
    emit SharesMinted(recipient, amount);
  }
}