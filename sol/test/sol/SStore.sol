pragma solidity ^0.5.5;

contract SStore {
  uint a = 5;
  function add(uint256 b) external {
    a = a+b;
  }
}