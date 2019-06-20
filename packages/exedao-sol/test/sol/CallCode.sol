pragma solidity 0.5.0;

contract CallCode {
  constructor() public {
    assembly {
      callcode()
    }
  }
}