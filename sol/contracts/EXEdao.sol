pragma solidity ^0.5.6;
pragma experimental ABIEncoderV2;

import "./DaoLib.sol";
import "./SafeMath.sol";

/*
---TODO---
- DILUTION BOUND
- Stake some ether on proposal to reimburse final executor
*/

contract EXEdao {
  using SafeMath for uint256;
  using SafeMath for uint128;
  using SafeMath for uint64;

  mapping(string => address payable) public methodAddresses;
  mapping(address => DaoLib.Daoist) public daoists; // shares held by each daoist
  DaoLib.DaoMeta public daoMeta;
  bytes32[] public proposalHashes;
  mapping(bytes32 => DaoLib.ProposalMeta) public proposals;
  mapping(uint => DaoLib.ProposalRequirement) public proposalRequirements;

  function requireCanVote(DaoLib.Daoist storage daoist) internal {
    require(!daoist.suspended && daoist.shares > 0, "Can not vote.");
  }

  function createDisbursement(uint128 ) internal {

  }

  function _mintShares() internal {

  }

  function _sendEther() internal {
    
  }

  function hashProposal(DaoLib.ProposalData memory proposal)
  public view returns (bytes32) {
    require(
      DaoLib.ProposalType(proposal.proposalType) != DaoLib.ProposalType.Default,
      "Invalid proposal type"
    );
    return keccak256(
      abi.encodePacked(
        proposal.proposalType, proposal.amount, proposal.recipient,
        proposal.callDataHash, proposal.method
      )
    );
  }

  function submitProposal(DaoLib.ProposalData calldata proposal)
  external payable {
    DaoLib.Daoist storage daoist = daoists[msg.sender];
    requireCanVote(daoist);
    bytes32 proposalHash = hashProposal(proposal);
    require(proposals[proposalHash].yesVotes == 0, "Proposal exists.");
    proposals[proposalHash] = DaoLib.ProposalMeta({
      expiryBlock: uint64(block.number + daoMeta.proposalDuration),
      yesVotes: daoist.shares,
      noVotes: 0
    });
    proposals[proposalHash].voters[msg.sender] = true;
    proposalHashes.push(proposalHash);
    daoMeta.lastProposalBlock = uint64(block.number);
    daoist.lastVoteBlock = uint64(block.number);
  }

  function voteProposal(uint proposalIndex, bool vote) external {
    DaoLib.Daoist storage daoist = daoists[msg.sender];
    requireCanVote(daoist);
    DaoLib.ProposalMeta storage proposal = proposals[proposalHashes[proposalIndex]];
    require(proposal.yesVotes > 0, "Proposal not open");
    require(!proposal.voters[msg.sender], "Daoist already voted");
    if (vote) proposal.yesVotes += daoist.shares;
    else proposal.noVotes += daoist.shares;
    daoist.lastVoteBlock = uint64(block.number);
  }

  function processProposal(uint proposalIndex, DaoLib.ProposalData calldata proposal) external {
    
  }


}