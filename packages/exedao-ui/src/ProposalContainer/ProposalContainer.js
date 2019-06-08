import React from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  Typography,
  Grid,
  LinearProgress,
  ButtonBase,
} from '@material-ui/core';

const getProposalHeader = (title, creationDate, timeLeft) => {
  return (
    <Grid
      style={{ paddingTop: 50, paddingLeft: 40, marginBottom: 50 }}
      container
      direction="column"
      justify="center"
      alignItems="flex-start"
    >
      <Grid item style={{ marginBottom: 5 }}>
        <Typography variant="h5">{title}</Typography>
      </Grid>
      <Grid item style={{ marginBottom: 5 }}>
        <Typography variant="overline">{creationDate}</Typography>
      </Grid>
      <Grid item style={{ marginBottom: 5 }}>
        <Typography variant="overline">{`Time Left: ${timeLeft}`}</Typography>
      </Grid>
    </Grid>
  );
};

const getProposalData = (shares, tribute) => {
  return (
    <Grid container direction="row" justify="center" alignItems="center">
      <Grid
        item
        style={{ paddingRight: 15, borderRight: '0.05em solid black' }}
      >
        {proposalDataContainer('Shares', shares)}
      </Grid>
      <Grid item style={{ paddingLeft: 15 }}>
        {proposalDataContainer('Tribute', tribute)}
      </Grid>
    </Grid>
  );
};

const proposalDataContainer = (name, value) => {
  return (
    <Grid container direction="column" justify="center" alignItems="center">
      <Grid item style={{ marginBottom: 5 }}>
        <Typography variant="subtitle1">{name}</Typography>
      </Grid>
      <Grid item style={{ marginBottom: 5 }}>
        <Typography variant="h6">{value}</Typography>
      </Grid>
    </Grid>
  );
};

const getVotesBar = (classes, yesVotes, noVotes) => {
  return (
    <Grid container direction="column" justify="center" alignItems="center">
      <Grid item style={{ width: 219, marginTop: 50 }}>
        <LinearProgress
          variant="determinate"
          value={yesVotes - noVotes / 100}
          classes={{
            root: classes.rootVotesBar,
            bar: classes.votesBar,
          }}
        />
      </Grid>
      <Grid
        container
        direction="row"
        justify="space-between"
        style={{ width: 219 }}
      >
        <Grid item>
          <Typography
            className={classes.votesLabel}
          >{`${yesVotes} Yes Votes`}</Typography>
        </Grid>
        <Grid item>
          <Typography
            className={classes.votesLabel}
          >{`${noVotes} No Votes`}</Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};

const ProposalContainer = ({
  classes,
  title,
  creationDate,
  timeLeft,
  shares,
  tribute,
  yesVotes,
  noVotes,
  handleClick,
}) => {
  return (
    <ButtonBase onClick={handleClick} className={classes.button}>
      <Paper className={classes.card} elevation={0}>
        {getProposalHeader(title, creationDate, timeLeft)}
        {getProposalData(shares, tribute)}
        {getVotesBar(classes, yesVotes, noVotes)}
      </Paper>
    </ButtonBase>
  );
};

export default ProposalContainer;
