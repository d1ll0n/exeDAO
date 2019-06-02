import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Paper, Tooltip } from '@material-ui/core';

const ProposalCard = ({
  classes,
  title,
  creationDate,
  timeLeft,
  shares,
  tribute,
  yesVotes,
  noVotes,
  inProgress,
  completed,
}) => {
  const getProposalInfo = () => {
    if (isLoading) {
      return null;
    }
    return (
      <>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="overline">{creationDate}</Typography>
        <Typography variant="overline">{timeLeft}</Typography>
      </>
    );
  };

  return (
    <Paper className={classes.proposalObject}>
      <div className={classes.titleContainer}>{getProposalInfo}</div>
    </Paper>
  );
};

export default ProposalCard;
