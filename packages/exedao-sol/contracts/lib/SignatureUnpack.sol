pragma solidity ^0.5.5;

library SignatureUnpack {
  function recoverOffline(bytes memory sig, uint256 nonce, bytes32 proposalHash) internal pure returns (address recovered) {
    bytes32 msgHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(abi.encodePacked(proposalHash, nonce))));
    uint8 v;
    bytes32 r;
    bytes32 s;
    assembly {
      v := shr(0xf8, mload(add(sig, 0x20)))
      r := mload(add(sig, 0x21))
      s := mload(add(sig, 0x41))
    }
    recovered = ecrecover(msgHash, v, r, s);
  }
}
