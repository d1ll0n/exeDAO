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

  struct Application {
    bytes32 metaHash;
    uint256 weiTribute;
    address applicant;
    address[] tokenTributes;
    uint256[] tokenTributeValues;
    uint64 shares;
  }
}