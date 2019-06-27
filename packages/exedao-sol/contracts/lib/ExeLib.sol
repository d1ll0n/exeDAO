pragma solidity ^0.5.5;

library ExeLib {
  struct Extension {
    bytes32 metaHash; // used to share abi and function descriptions
    address extensionAddress;
    bool useDelegate;
    bytes bytecode;
    bytes4[] functionSignatures;
  }

  function isPermissible (bytes memory bytecode)
  internal pure returns (bool) {
    uint256 size = bytecode.length;
    uint256 permissible = 1;
    assembly {
      let ptr := add(bytecode, 0x20)
      for { let i := 0 } and(lt(i, size), permissible) { i := add(i, 0x1) } {
        let op := shr(0xf8, mload(add(ptr, i)))
        switch op
        case 0xf2 { permissible := 0 } // callcode
        case 0xf4 { permissible := 0 } // delegatecall
        case 0x55 { permissible := 0 } // sstore
        case 0xff { permissible := 0 } // selfdestruct
        default {
          let isPush := and(lt(op, 0x80), gt(op, 0x5f))
          if eq(isPush, 0x1) { i := add(i, sub(op, 0x5f)) }
        }
      }
    }
    return permissible == 1;
  }

  function deploy(bytes memory bytecode) internal returns (address extAddress) {
    uint256 size = bytecode.length;
    assembly {
      let start := add(bytecode, 0x20)
      extAddress := create(0, start, size)
    }
  }

  function delegateExecute(bytes memory bytecode) internal {
    uint256 size = bytecode.length;
    assembly {
      let start := add(bytecode, 0x20)
      let delegateTo := create(0, start, size)
      let retptr := mload(0x40)
      let delegateSuccess := delegatecall(gas, delegateTo, 0, 0, retptr, 0)
      let retsize := returndatasize
      returndatacopy(retptr, 0, returndatasize)
      if iszero(delegateSuccess) { revert(retptr, returndatasize) }
      let freeptr := add(retptr, retsize)
      mstore(freeptr, 0x41c0e1b500000000000000000000000000000000000000000000000000000000)
      let selfdestructSuccess := call(gas, delegateTo, 0, freeptr, 0x20, freeptr, 0)
      if iszero(selfdestructSuccess) {
        returndatacopy(retptr, 0, returndatasize)
        revert(retptr, returndatasize)
      }
      return(retptr, retsize)
    }
  }

  function delegateExecute(address delegateTo) internal {
    assembly {
      let startCalldata := mload(0x40)
      calldatacopy(startCalldata, 0, calldatasize)
      let retptr := add(startCalldata, calldatasize)
      let delegateSuccess := delegatecall(gas, delegateTo, startCalldata, calldatasize, retptr, 0)
      returndatacopy(retptr, 0, returndatasize)
      if delegateSuccess { return (retptr, returndatasize) }
      revert(retptr, returndatasize)
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
      revert(retptr, returndatasize)
    }
  }
}
