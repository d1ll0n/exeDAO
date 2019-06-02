pragma solidity ^0.5.5;

contract Output {
  function add(uint a, uint b)
  external pure returns (uint) { return a + b; }
}