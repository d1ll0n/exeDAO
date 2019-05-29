pragma solidity ^0.5.6;

import "./SafeMath.sol";
import "./DaoLib.sol";

contract Shared {
  using SafeMath for uint;
  using SafeMath for uint64;

  uint64 public totalShares;
  uint64[] daoShares;
  mapping(address => uint) public daoistIndices;

  event SharesBurned(address indexed daoist, uint64 shares, uint value);
  event SharesMinted(address indexed daoist, uint64 shares);

  function getShares() internal view returns (uint64 shares) {
    shares = daoShares[daoistIndices[msg.sender]];
    require(shares > 0, "Not a daoist.");
  }

  function burnShares(uint64 amount) external {
    uint shares = getShares();
    require(shares > amount, "Not enough shares");
    daoShares[daoistIndices[msg.sender]] = uint64(shares.sub(amount));
    uint value = address(this).balance.div(totalShares).mul(amount);
    msg.sender.transfer(value);
    emit SharesBurned(msg.sender, amount, value);
  }

  function _mintShares(address recipient, uint64 amount) internal {
    if (daoistIndices[recipient] == 0) {
      daoistIndices[recipient] = daoShares.length;
      daoShares.push(amount);
    } else {
      daoShares[daoistIndices[recipient]] = uint64(daoShares[daoistIndices[recipient]].add(amount));
    }
    emit SharesMinted(recipient, amount);
  }
}