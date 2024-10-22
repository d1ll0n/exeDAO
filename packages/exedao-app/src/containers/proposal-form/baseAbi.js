export default [
  {
    "constant": true,
    "inputs": [{ "name": "", "type": "uint256" }],
    "name": "proposals",
    "outputs": [
      { "name": "expiryBlock", "type": "uint32" },
      { "name": "yesVotes", "type": "uint32" },
      { "name": "noVotes", "type": "uint32" }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "amount", "type": "uint32" }],
    "name": "burnShares",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "funcSig", "type": "bytes4" },
      { "name": "requirement", "type": "uint8" }
    ],
    "name": "setProposalRequirement",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "", "type": "address" }],
    "name": "buyRequests",
    "outputs": [
      { "name": "lockedwei", "type": "uint256" },
      { "name": "amount", "type": "uint32" }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "applicant", "type": "address" }],
    "name": "executeBuyOffer",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "proposalDuration",
    "outputs": [{ "name": "", "type": "uint32" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "bytecode", "type": "bytes" }],
    "name": "safeExecute",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "proposalHash", "type": "bytes32" }],
    "name": "cancelProposal",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalShares",
    "outputs": [{ "name": "", "type": "uint32" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "proposalHash", "type": "bytes32" }],
    "name": "getProposal",
    "outputs": [
      {
        "components": [
          { "name": "expiryBlock", "type": "uint32" },
          { "name": "yesVotes", "type": "uint32" },
          { "name": "noVotes", "type": "uint32" },
          { "name": "proposalIndex", "type": "uint256" }
        ],
        "name": "ret",
        "type": "tuple"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "", "type": "address" }],
    "name": "daoists",
    "outputs": [{ "name": "", "type": "uint32" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "", "type": "bytes32" }],
    "name": "proposalIndices",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getExtensions",
    "outputs": [
      {
        "components": [
          { "name": "extensionAddress", "type": "address" },
          { "name": "useDelegate", "type": "bool" },
          { "name": "rawFunctions", "type": "string[]" }
        ],
        "name": "ret",
        "type": "tuple[]"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "", "type": "bytes4" }],
    "name": "extensionFor",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "extensionAddress", "type": "address" },
      { "name": "useDelegate", "type": "bool" },
      { "name": "rawFunctions", "type": "string[]" }
    ],
    "name": "addExtension",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getOpenProposals",
    "outputs": [
      {
        "components": [
          { "name": "expiryBlock", "type": "uint32" },
          { "name": "yesVotes", "type": "uint32" },
          { "name": "noVotes", "type": "uint32" },
          { "name": "proposalIndex", "type": "uint256" }
        ],
        "name": "ret",
        "type": "tuple[]"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "lastExpiredProposal",
    "outputs": [{ "name": "", "type": "uint32" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "bytecode", "type": "bytes" }],
    "name": "unsafeExecute",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "shares", "type": "uint32" }],
    "name": "requestShares",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "", "type": "bytes32" }],
    "name": "proposalIPFSHashes",
    "outputs": [{ "name": "", "type": "bytes32" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "proposalHash", "type": "bytes32" },
      { "name": "vote", "type": "bool" }
    ],
    "name": "submitOrVote",
    "outputs": [
      { "name": "", "type": "uint256" },
      { "name": "", "type": "uint256" },
      { "name": "", "type": "uint256" }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "", "type": "bytes4" }],
    "name": "proposalRequirements",
    "outputs": [{ "name": "", "type": "uint8" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "extIndex", "type": "uint256" }],
    "name": "removeExtension",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "proposalHash", "type": "bytes32" },
      { "name": "ipfsHash", "type": "bytes32" }
    ],
    "name": "submitWithIPFSHash",
    "outputs": [{ "name": "index", "type": "uint256" }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "recipient", "type": "address" },
      { "name": "amount", "type": "uint32" }
    ],
    "name": "mintShares",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "", "type": "uint256" }],
    "name": "extensions",
    "outputs": [
      { "name": "extensionAddress", "type": "address" },
      { "name": "useDelegate", "type": "bool" }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "value", "type": "uint256" }],
    "name": "setMinimumRequestValue",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "index", "type": "uint256" }],
    "name": "getExtension",
    "outputs": [
      {
        "components": [
          { "name": "extensionAddress", "type": "address" },
          { "name": "useDelegate", "type": "bool" },
          { "name": "rawFunctions", "type": "string[]" }
        ],
        "name": "ret",
        "type": "tuple"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "shares", "type": "uint32" },
      { "name": "_proposalDuration", "type": "uint32" },
      { "name": "funcSigs", "type": "bytes4[]" },
      { "name": "requirements", "type": "uint8[]" }
    ],
    "payable": true,
    "stateMutability": "payable",
    "type": "constructor"
  },
  { "payable": true, "stateMutability": "payable", "type": "fallback" },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "submitter", "type": "address" },
      { "indexed": true, "name": "proposalHash", "type": "bytes32" },
      { "indexed": false, "name": "votesCast", "type": "uint32" },
      { "indexed": false, "name": "vote", "type": "bool" }
    ],
    "name": "ProposalSubmission",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "voter", "type": "address" },
      { "indexed": true, "name": "proposalHash", "type": "bytes32" },
      { "indexed": false, "name": "votesCast", "type": "uint32" },
      { "indexed": false, "name": "vote", "type": "bool" }
    ],
    "name": "ProposalVote",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "voter", "type": "address" },
      { "indexed": true, "name": "proposalHash", "type": "bytes32" }
    ],
    "name": "ProposalApproval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "proposalHash", "type": "bytes32" }
    ],
    "name": "ProposalExpiration",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "daoist", "type": "address" },
      { "indexed": false, "name": "shares", "type": "uint32" },
      { "indexed": false, "name": "value", "type": "uint256" }
    ],
    "name": "SharesBurned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "daoist", "type": "address" },
      { "indexed": false, "name": "shares", "type": "uint32" }
    ],
    "name": "SharesMinted",
    "type": "event"
  }
]