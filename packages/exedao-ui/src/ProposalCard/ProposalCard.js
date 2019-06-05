import React, {Fragment} from 'react';
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
    if (inProgress) {
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
      <div className={classes.titleContainer}>{getProposalInfo()}</div>
    </Paper>
  );
};

ProposalCard.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  creationDate: PropTypes.string.isRequired,
  timeLeft: PropTypes.string.isRequired,
};

export default ProposalCard;
