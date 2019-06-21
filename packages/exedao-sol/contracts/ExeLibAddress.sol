pragma solidity ^0.5.5;

library ExeLibAddress {
  function delegateExecute(address delegateTo) internal {
    assembly {
      let startCalldata := mload(0x40)
      calldatacopy(startCalldata, 0, calldatasize)
      let retptr := add(startCalldata, calldatasize)
      let delegateSuccess := delegatecall(gas, delegateTo, startCalldata, calldatasize, retptr, 0)
      returndatacopy(retptr, 0, returndatasize)
      if delegateSuccess { return (retptr, returndatasize) }
      revert(0, 0)
    }
  }

  function doCall(address callAddress) internal {
    assembly {
      let startCalldata := mload(0x40)
      calldatacopy(startCalldata, 0, calldatasize)
      let retptr := add(startCalldata, calldatasize)
      let callSuccess := call(gas, callAddress, callvalue, startCalldata, calldatasize, retptr, 0)
      returndatacopy(retptr, 0, returndatasize)
      if callSuccess { return (retptr, returndatasize) }
      revert(0, 0)
    }
  }
  
  function bytecodeAt(address deployedAddress)
  internal view returns (bytes memory bytecode) {
    uint size;
    assembly { size := extcodesize(deployedAddress) }
    bytecode = new bytes(size);
    assembly { extcodecopy(deployedAddress, add(bytecode, 0x20), 0, size) }
  }
}
