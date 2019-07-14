pragma solidity 0.5.0;

contract ExecuteAdd {
  event Added(uint c);

  function () external payable {
    emit Added(5);
  }
}