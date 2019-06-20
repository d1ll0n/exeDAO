pragma solidity 0.5.0;

contract Output {
  event Added(uint c);
  function add(uint256 a, uint256 b) external returns (uint) {
    emit Added(a+b);
    return a + b;
  }
}