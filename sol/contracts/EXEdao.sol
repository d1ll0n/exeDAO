pragma solidity ^0.5.6;
pragma experimental ABIEncoderV2;

import "./DaoLib.sol";
import "./EXElib.sol";
import "./SafeMath.sol";
import "./DividendSafe.sol";

/*
---TODO---
- DILUTION BOUND
- Stake some ether on proposal to reimburse final executor
*/

contract EXEdao {
  using SafeMath for uint;
  using SafeMath for uint128;
  using SafeMath for uint64;
  using EXElib for bytes;

  DividendSafe public dividendSafe;
  uint64 public totalShares;
  uint64 public proposalDuration;
  uint64 public saleDuration;

  mapping(address => uint64) public daoists; // shares held by each daoist
  address payable[] daoistList;
  bytes32[] public proposalHashes;
  mapping(bytes32 => DaoLib.ProposalMeta) public proposals;
  mapping(uint => DaoLib.ProposalRequirement) public proposalRequirements;

  DaoLib.ShareSale public shareSale;

  event ProposalSubmission(
    address payable indexed submitter,
    bytes32 indexed proposalHash,
    bytes32 rawCodeHash,
    uint64 votesCast
  );
  event ProposalVote(address indexed voter, bytes32 indexed proposalHash, uint64 votesCast);
  event ProposalProcessed();
  event ShareSaleUpdate(uint64 shares, uint128 price);
  event SharesMinted(address indexed daoist, uint64 shares);

  constructor() public {
    dividendSafe = new DividendSafe();
  }

  function hashProposal(DaoLib.ProposalData memory proposal)
  public pure returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        proposal.proposalType, proposal.value,
        proposal.recipient, proposal.callData
      )
    );
  }

  function getShares() internal view returns (uint64 shares) {
    shares = daoists[msg.sender];
    require(shares > 0, "Not a daoist.");
  }

  function shareValue() public view returns(uint) {
    return address(this).balance.div(totalShares);
  }

  function getDaoists() external view
  returns (address payable[] memory _daoists, uint64[] memory shares) {
    uint size = daoistList.length;
    _daoists = new address payable[](size);
    shares = new uint64[](size);
    for (uint i = 0; i < size; i++) {
      address payable daoist = daoistList[i];
      _daoists[i] = daoist;
      shares[i] = daoists[daoist];
    }
  }

  function buyShares(uint64 shares) external payable {
    require(shareSale.shares >= shares, "Shares unavailable");
    uint price = shares.mul(shareSale.price);
    uint r = price.sub(msg.value);
    require(r >= 0, "Insufficient funds provided.");
    shareSale.shares = uint64(shareSale.shares.add(shares));
    daoists[msg.sender] = uint64(daoists[msg.sender].add(shares));
    if (r > 2100 * tx.gasprice) msg.sender.transfer(r);
  }

  function burnShares(uint64 amount) external {
    uint64 shares = daoists[msg.sender];
    require(shares > amount, "Not enough shares");
    daoists[msg.sender] = uint64(shares.sub(amount));
    uint value = address(this).balance.div(totalShares).mul(shares);
    msg.sender.transfer(value);
  }

  function _disburse(uint128 amount) internal {
    dividendSafe.disburseDividends.value(amount)(totalShares);
  }

  function _sellShares(bytes memory callData) internal {
    (uint64 shares, uint128 price) = abi.decode(callData, (uint64, uint128));
    shareSale = DaoLib.ShareSale({
      expiryBlock: uint64(block.number + saleDuration),
      shares: shares,
      price: price
    });
  }

  function _mintShares(address daoist, uint128 shares) internal {
    daoists[daoist] = uint64(daoists[daoist].add(shares));
    totalShares = uint64(totalShares.add(shares));
  }

  function _sendEther(address payable recipient, uint128 amount) internal {
    recipient.transfer(amount);
  }

  function _execute(bytes memory bytecode) internal {
    bytes memory sanitized = bytecode.sanitizeBytecode();
    uint size = sanitized.length;
    assembly {
      let start := add(sanitized, /*BYTES_HEADER_SIZE*/32)
      let delegateTo := create(0, start, size)
      let freeptr := mload(0x40)
      let delegateSuccess := delegatecall(gas, delegateTo, 0, 0, 0, 0)
      mstore(freeptr, 0x41c0e1b500000000000000000000000000000000000000000000000000000000)
      let selfdestructSuccess := call(gas, delegateTo, 0, freeptr, 0x20, 0, 0)
      if eq(and(delegateSuccess, selfdestructSuccess), 0) {
        revert(0, 0)
      }
    }
  }

  function _setProposalRequirement(bytes memory typeInfo) internal {
    DaoLib.ProposalType pType = DaoLib.ProposalType(uint8(typeInfo[0]));
    DaoLib.ProposalRequirement pReq = DaoLib.ProposalRequirement(uint8(typeInfo[1]));
    proposalRequirements[uint8(pType)] = pReq;
  }

  function submitProposal(bytes32 proposalHash, bytes32 rawCodeHash) public {
    uint64 shares = getShares();
    uint proposalIndex = proposalHashes.length;
    bytes32 realHash = keccak256(abi.encodePacked(proposalHash, proposalIndex));
    proposalHashes.push(realHash);
    proposals[proposalHash] = DaoLib.ProposalMeta({
      expiryBlock: uint64(block.number + proposalDuration),
      yesVotes: shares,
      noVotes: 0
    });
    emit ProposalSubmission(msg.sender, realHash, rawCodeHash, shares);
  }

  function submitProposal(bytes32 proposalHash) external {
    submitProposal(proposalHash, "");
  }

  function voteProposal(bytes32 proposalHash, bool vote) public {
    uint64 shares = getShares();
    DaoLib.ProposalMeta storage proposal = proposals[proposalHash];
    require(proposal.yesVotes > 0, "Proposal not open");
    require(!proposal.voters[msg.sender], "Duplicate vote");
    if (vote) proposal.yesVotes = uint64(proposal.yesVotes.add(shares));
    else proposal.noVotes = uint64(proposal.noVotes.add(shares));
  }

  function processProposal(uint proposalIndex, DaoLib.ProposalData calldata proposalData) external {
    bytes32 proposalHash = hashProposal(proposalData);
    bytes32 realHash = keccak256(abi.encodePacked(proposalHash, proposalIndex));
    DaoLib.ProposalMeta storage proposal = proposals[realHash];
    require(proposal.yesVotes > 0, "Proposal not open");
    DaoLib.ProposalType proposalType = DaoLib.ProposalType(proposalData.proposalType);
    DaoLib.ProposalRequirement requirement = proposalRequirements[proposalData.proposalType];
    require(
      DaoLib.isProposalApproved(
        requirement, proposal.yesVotes,
        proposal.noVotes, totalShares
      ), "Not approved."
    );
    
    proposal.yesVotes = 0;
    if (proposalType == DaoLib.ProposalType.Disburse)
      _disburse(proposalData.value);
    if (proposalType == DaoLib.ProposalType.SellShares)
      _sellShares(proposalData.callData);
    if (proposalType == DaoLib.ProposalType.MintShares)
      _mintShares(proposalData.recipient, proposalData.value);
    if (proposalType == DaoLib.ProposalType.SendEther)
      _sendEther(proposalData.recipient, proposalData.value);
    if (proposalType == DaoLib.ProposalType.Execute)
      _execute(proposalData.callData);
    if (proposalType == DaoLib.ProposalType.SetProposalRequirement)
      _setProposalRequirement(proposalData.callData);
  }
}