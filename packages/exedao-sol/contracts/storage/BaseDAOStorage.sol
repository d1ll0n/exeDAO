pragma solidity ^0.5.5;
pragma experimental ABIEncoderV2;

import "../lib/SafeMath.sol";
import "../lib/IERC20.sol";
import "../lib/DaoLib.sol";
import "../lib/Indices.sol";

/**
 * @title BaseDAOStorage
 * @author Dillon Kellar, Raymond Pulver
 * @dev Storage and getters for BaseDao.sol
 * @notice Makes the contract less cluttered by separating getters and storage setup into a separate contract.
 */
contract BaseDAOStorage {
  using SafeMath for uint64;
  using SafeMath for uint256;

  uint256 internal _multiplier = 2 finney;
  uint64 internal _totalShares;
  DaoLib.Daoist[] internal _daoists;
  mapping(address => Indices.Index) internal _daoistIndices;
  IERC20[] internal _tokens;
  mapping(address => Indices.Index) internal _tokenIndices;

  function getTotalShares() external view returns (uint64 totalShares) {
    totalShares = _totalShares;
  }

  function getDaoist(address daoistAddress) public view returns (DaoLib.DaoistOutput memory daoist) {
    Indices.Index memory index = _daoistIndices[daoistAddress];
    require(index.exists, "ExeDAO: Daoist not found");
    DaoLib.Daoist memory _daoist = _daoists[index.index];
    daoist = DaoLib.DaoistOutput(_daoist.daoist, _daoist.shares, index.index);
  }

  function getDaoists() external view returns (DaoLib.Daoist[] memory daoists) {
    uint256 size = _daoists.length;
    daoists = new DaoLib.Daoist[](size);
    for (uint256 i = 0; i < size; i++) daoists[i] = _daoists[i];
  }

  function getToken(address tokenAddress) external view returns (DaoLib.TokenValue memory tokenValue) {
    IERC20 _token = _getToken(tokenAddress);
    uint256 balance = _token.balanceOf(address(this));
    tokenValue = DaoLib.TokenValue(address(_token), balance);
  }

  function getTokens() external view returns (DaoLib.TokenValue[] memory tokenBalances) {
    uint256 size = _tokens.length;
    tokenBalances = new DaoLib.TokenValue[](size);
    for (uint256 i = 0; i < size; i++) {
      uint256 balance = _tokens[i].balanceOf(address(this));
      tokenBalances[i] = DaoLib.TokenValue(address(_tokens[i]), balance);
    }
  }

  function _getToken(address tokenAddress) internal view returns (IERC20 token) {
    Indices.Index memory index = _tokenIndices[tokenAddress];
    require(index.exists, "ExeDAO: Token not found");
    token = _tokens[index.index];
  }
}