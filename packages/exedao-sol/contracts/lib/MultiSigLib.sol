pragma solidity ^0.5.5;

library MultiSigLib {
  struct Signature {
    uint256 nonce;
    bytes signature;
  }

  function recoverSignature(Signature memory sigData, bytes32 proposalHash)
  internal pure returns (address recovered) {
    bytes32 msgHash = keccak256(abi.encodePacked(
      "\x19Ethereum Signed Message:\n32",
      keccak256(abi.encodePacked(proposalHash, sigData.nonce))
    ));
    uint8 v;
    bytes32 r;
    bytes32 s;
    bytes memory sig = sigData.signature;
    assembly {
      v := shr(0xf8, mload(add(sig, 0x20)))
      r := mload(add(sig, 0x21))
      s := mload(add(sig, 0x41))
    }
    recovered = ecrecover(msgHash, v, r, s);
  }

  function prefixHash(bytes32 proposalHash, uint256 nonce) internal pure returns (bytes32 prefixedHash) {
    bytes32 approvalHash = keccak256(abi.encodePacked(nonce, proposalHash));
    prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", approvalHash));
  }

  /**
   * @dev Extract a single signature from a byte array of signatures
   * @param signatures Byte array of signatures
   * @param index Index of the signature in the byte array
   * @notice taken from https://github.com/argentlabs/argent-contracts/blob/develop/contracts/MultiSigWallet.sol
  */
  /* function splitSignature(bytes memory signatures, uint256 index) internal pure
  returns (uint8 v, bytes32 r, bytes32 s) {
    // we jump 32 (0x20) as the first slot of bytes contains the length
    // we jump 65 (0x41) per signature
    // for v we load 32 bytes ending with v (the first 31 come from s) tehn apply a mask
    assembly {
      r := mload(add(signatures, add(0x20,mul(0x41,index))))
      s := mload(add(signatures, add(0x40,mul(0x41,index))))
      v := and(mload(add(signatures, add(0x41,mul(0x41,index)))), 0xff)
    }
    require(v == 27 || v == 28, "ExeDAO: Invalid v");
  } */
}