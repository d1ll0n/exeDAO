pragma solidity ^0.5.6;
pragma experimental ABIEncoderV2;
import "./SafeMath.sol";

/*
 * This implementation uses the solution for dividends proposed by Nick Johnson
 * https://ethereum.stackexchange.com/a/10865
*/

interface IEXEdao {
  function daoistShares(address daoist) external view returns (uint);
}

contract DividendSafe {
  using SafeMath for uint;

  event DisbursalAdded(uint disbursalValue, uint totalShares);
  event DividendsClaimed(address indexed shareHolder, uint shares, uint dividendValue);

  IEXEdao EXEdao;
  uint constant pointMultiplier = 10e12; // reduce possibility of rounding errors
  mapping(address => uint) lastDividendPoints; // last dividends claimed
  uint public totalDividendPoints;
  uint public _unclaimedDividends; // eth value of unclaimed dividends

  constructor() public {
    EXEdao = IEXEdao(msg.sender);
  }

  function disburseDividends(uint totalShares) external payable {
    require(msg.value > 0, "No funds sent.");
    totalDividendPoints = totalDividendPoints.add(msg.value.mul(pointMultiplier).div(totalShares));
    _unclaimedDividends = _unclaimedDividends.add(msg.value);
    emit DisbursalAdded(msg.value, totalShares);
  }

  function unclaimedDividends(address shareHolder, uint shares) public view returns (uint) {
    uint256 dividendPoints = totalDividendPoints.sub(lastDividendPoints[shareHolder]);
    return shares.mul(dividendPoints).div(pointMultiplier);
  }

  function claimDividend() external {
    uint shares = EXEdao.daoistShares(msg.sender);
    require(shares > 0, "Not a daoist");
    uint256 owedWei = unclaimedDividends(msg.sender, shares);
    _unclaimedDividends = _unclaimedDividends.sub(owedWei);
    lastDividendPoints[msg.sender] = totalDividendPoints;
    msg.sender.transfer(owedWei);
    emit DividendsClaimed(msg.sender, shares, owedWei);
  }
}