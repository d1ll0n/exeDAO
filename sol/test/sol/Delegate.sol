pragma solidity ^0.5.5;

contract Delegate {
  constructor() public { msg.sender.delegatecall(msg.data); }
}