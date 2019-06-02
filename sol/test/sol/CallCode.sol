pragma solidity ^0.5.5;

contract CallCode {
  constructor() public {
    assembly {
      callcode()
    }
  }
}