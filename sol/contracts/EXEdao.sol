pragma solidity ^0.5.6;
pragma experimental ABIEncoderV2;

import "./DaoLib.sol";
import "./SafeMath.sol";
import "./DividendSafe.sol";

/*
---TODO---
- DILUTION BOUND
- Stake some ether on proposal to reimburse final executor
*/

contract EXEdao {
  using SafeMath for uint256;
  using SafeMath for uint128;
  using SafeMath for uint64;

  DividendSafe dividendSafe;
  uint public totalShares;
  uint public proposalDuration;
  uint public saleDuration;

  mapping(address => uint) public daoists; // shares held by each daoist
  bytes32[] public proposalHashes;
  mapping(bytes32 => DaoLib.ProposalMeta) public proposals;
  mapping(uint => DaoLib.ProposalRequirement) public proposalRequirements;

  constructor() public {
    dividendSafe = new DividendSafe();
  }

  function daoistShares(address daoist) external view returns (uint) {
    return daoists[daoist];
  }

  function _disburse(uint amount) internal {
    dividendSafe.disburseDividends.value(amount)(totalShares);
  }

  function _sellShares(uint shares, uint price) internal {

  }

  function _mintShares(address daoist, uint shares) internal {
    daoists[daoist] = daoists[daoist].add(shares);
    totalShares = totalShares.add(shares);
  }

  function _sendEther(address payable recipient, uint amount) internal {
    recipient.transfer(amount);
  }

  function _execute(bytes memory bytecode, bytes32 codeHash) internal {

  }

  function _setProposalRequirement(bytes memory typeInfo) internal {
    DaoLib.ProposalType mProposalType = DaoLib.ProposalType(uint8(typeInfo[0]));
    DaoLib.ProposalRequirement mProposalRequirement
      = DaoLib.ProposalRequirement(uint8(typeInfo[1]));
    require(
      mProposalType != DaoLib.ProposalType.SetProposalRequirement &&
      mProposalType != DaoLib.ProposalType.Default &&
      mProposalRequirement != DaoLib.ProposalRequirement.Default,
      "Invalid types."
    );
    proposalRequirements[uint8(mProposalType)] = mProposalRequirement;

  }

  function hashProposal(DaoLib.ProposalData memory proposal)
  public view returns (bytes32) {
    require(
      DaoLib.ProposalType(proposal.proposalType) != DaoLib.ProposalType.Default,
      "Invalid proposal type"
    );
    return keccak256(
      abi.encodePacked(
        proposal.proposalType, proposal.value,
        proposal.recipient, proposal.callDataHash
      )
    );
  }

  function submitProposal(DaoLib.ProposalData calldata proposal)
  external payable {
    uint shares = daoists[msg.sender];
    require(shares > 0, "Not a daoist.");
    require(
      DaoLib.ProposalType(proposal.proposalType) != DaoLib.ProposalType.Default, "Invalid proposal type");
    bytes32 proposalHash = hashProposal(proposal);
    require(proposals[proposalHash].yesVotes == 0, "Proposal exists.");
    proposals[proposalHash] = DaoLib.ProposalMeta({
      expiryBlock: uint64(block.number + proposalDuration),
      yesVotes: uint128(shares),
      noVotes: 0
    });
    proposals[proposalHash].voters[msg.sender] = true;
    proposalHashes.push(proposalHash);
  }

  function voteProposal(uint proposalIndex, bool vote) external {
    uint shares = daoists[msg.sender];
    require(shares > 0, "Not a daoist.");
    DaoLib.ProposalMeta storage proposal = proposals[proposalHashes[proposalIndex]];
    require(proposal.yesVotes > 0, "Proposal not open");
    require(!proposal.voters[msg.sender], "Duplicate vote");
    if (vote) proposal.yesVotes = uint128(proposal.yesVotes.add(shares));
    else proposal.noVotes = uint128(proposal.noVotes.add(shares));
  }

  function processProposal(uint proposalIndex, DaoLib.ProposalData calldata proposalData) external {
    bytes32 proposalHash = hashProposal(proposalData);
    require(proposalHashes[proposalIndex] == proposalHash, "Bad proposal hash");
    DaoLib.ProposalMeta storage proposal = proposals[proposalHash];
    require(proposal.yesVotes > 0, "Proposal not open");
    DaoLib.ProposalType proposalType = DaoLib.ProposalType(proposalData.proposalType);
    DaoLib.ProposalRequirement requirement = proposalRequirements[proposalData.proposalType];
    require(
      DaoLib.isProposalApproved(
        requirement, proposal.yesVotes,
        proposal.noVotes, totalShares
      ), "Not approved."
    );
    require(
      proposalData.callData.length == 0 ||
      keccak256(abi.encodePacked(proposalData.callData)) == proposalData.callDataHash,
      "Bad callData hash"
    );
    proposal.yesVotes = 0;
    if (proposalType == DaoLib.ProposalType.Disburse)
      _disburse(proposalData.value);
    if (proposalType == DaoLib.ProposalType.SellShares)
      _sellShares(uint(proposalData.callDataHash), proposalData.value);
    if (proposalType == DaoLib.ProposalType.MintShares)
      _mintShares(proposalData.recipient, proposalData.value);
    if (proposalType == DaoLib.ProposalType.SendEther)
      _sendEther(proposalData.recipient, proposalData.value);
    if (proposalType == DaoLib.ProposalType.Execute)
      _execute(proposalData.callData, proposalData.callDataHash);
    if (proposalType == DaoLib.ProposalType.SetProposalRequirement)
      _setProposalRequirement(proposalData.callData);

  }


}