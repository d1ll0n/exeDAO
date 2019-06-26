const votesNeeded = (approvalRequirement, totalShares, votes) => {
  if (approvalRequirement == 255) return 0;
  const totalNeeded = Math.floor(totalShares * approvalRequirement / 100);
  return votes >= totalNeeded ? 0 : totalNeeded-votes;
};

module.exports = {
  votesNeeded
};