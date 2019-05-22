pragma solidity ^0.5.0;

library EXEUtils {
  function sanitizeBytecode (bytes memory bytecode)
  internal pure returns (bytes memory) {
    uint size = bytecode.length;
    assembly {
      let ptr := bytecode
      let start := mload(0x40)
      let i := 0
      for { } lt(i, size) { i := add(i, 1) } {
        let op := shr(248, mload(add(ptr, i)))
        switch op
        case 0x55 {
          // sstore handler -- no need to sstore, just revert
          mstore8(add(start, i), 0xfd)
        }
        case 0xf2 {
          // callcode handler -- no need to callcode, don't want to circumvent sstore
          mstore(add(start, i), 0xfd)
        }
        case 0xf4 {
          // delegatecall handler -- we don't need to delegate in a temporary contract, can only be used to circumvent sstore
          mstore(add(start, i), 0xfd)
        }
        default {
          let isPush := and(lt(op, 0x80), gt(op, 0x5f))
          if eq(isPush, 1) {
            mstore8(add(start, i), op)
            let sz := sub(33, sub(0x80, op))
            let bits := shr(sub(256, mul(sz, 8)), mload(add(add(ptr, 1), i)))
            mstore(add(add(start, i), 1), shl(sub(256, mul(sz, 8)), bits))
            i := add(i, sz)
          }
          if eq(isPush, 0) {
            mstore8(add(start, i), op)
          }
        }
      }
      return(start, i)
    }
  }

  function killMethod() internal {
    
  }
}