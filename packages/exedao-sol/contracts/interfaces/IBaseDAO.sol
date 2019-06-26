pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "../lib/DaoLib.sol";

interface IBaseDAO {
  function getDaoist(address daoistAddress) external view returns (DaoLib.DaoistOutput memory daoist);
  function getDaoists() external view returns (DaoLib.Daoist[] memory daoists);
  function getToken(address tokenAddress) external view returns (DaoLib.TokenValue memory token);
  function getTokens() external view returns (DaoLib.TokenValue[] memory tokens);
  function burnShares(uint64 amount) external returns(uint256 weiValue, DaoLib.TokenValue[] memory tokenBurnValues);
}