pragma solidity ^0.5.5;

contract Delegate {
  function add(uint256 a) external {
    msg.sender.delegatecall(msg.data);
  }
}