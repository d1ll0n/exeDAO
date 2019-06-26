pragma solidity ^0.5.5;

library DaoLib {
  struct Daoist {
    address daoist;
    uint64 shares;
  }

  struct DaoistOutput {
    address daoist;
    uint64 shares;
    uint248 index;
  }

  struct TokenValue {
    address tokenAddress;
    uint256 value;
  }

  struct BuyRequest {
    address applicant;
    bytes32 metaHash;
    uint256 lockedWei;
    address[] lockedTokens;
    uint256[] lockedTokenValues;
    uint64 shares;
  }
}