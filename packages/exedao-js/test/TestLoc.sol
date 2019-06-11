pragma solidity ^0.5.5;

contract TestLoc {
  function add(uint256 a, uint256 b) external returns (uint c) {
    c = a+b;
  }

  function sub(uint256 a, uint256 b) external returns (uint c) {
    c = a-b;
    assembly { sstore(0xfce, 0xfce) }
  }
}