pragma solidity ^0.5.5;

/**
 * @title SafeMath
 * @dev Unsigned math operations with safety checks that revert on error
*/
library SafeMath {
  /**
  * @dev Multiplies two unsigned integers, reverts on overflow.
  */
  function mul(uint a, uint b) internal pure returns (uint) {
    // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
    // benefit is lost if 'b' is also tested.
    // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
    if (a == 0) return 0;
    uint c = a * b;
    require(c / a == b, "SM: mul error");
    return c;
  }

  /**
  * @dev Integer division of two unsigned integers truncating the quotient, reverts on division by zero.
  */
  function div(uint a, uint b) internal pure returns (uint) {
    // Solidity only automatically asserts when dividing by 0
    require(b > 0, "SM: div error");
    uint c = a / b;
    return c;
  }

  /**
  * @dev Subtracts two unsigned integers, reverts on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint a, uint b) internal pure returns (uint) {
    require(b <= a, "SM: sub error");
    uint c = a - b;
    return c;
  }

  /**
  * @dev Adds two unsigned integers, reverts on overflow.
  */
  function add(uint a, uint b) internal pure returns (uint) {
    uint c = a + b;
    require(c >= a, "SM: add error");
    return c;
  }

  /**
  * @dev Divides two unsigned integers and returns the remainder (unsigned integer modulo),
  * reverts when dividing by zero.
  */
  function mod(uint a, uint b) internal pure returns (uint) {
    require(b != 0);
    return a % b;
  }
}