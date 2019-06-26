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

  struct TokenOutput {
    address tokenAddress;
    uint256 balance;
  }

  struct BuyRequest {
    bytes32 metaHash;
    uint256 lockedwei;
    uint64 amount;
  }
}