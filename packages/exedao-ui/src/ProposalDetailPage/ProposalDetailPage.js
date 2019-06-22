import React from "react";
import { Paper, Grid, Typography, LinearProgress, List, ListItem, ListSubheader, Button } from "@material-ui/core";
import FunctionArguments from '../FunctionArguments';

const getProposalHeader = (title, description) => {
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
        <Typography variant="overline">{`${description}`}</Typography>
      </Grid>
    </Grid>
  );
};

const getVotesBar = (classes, votesNeeded, currentVotes, handleClick) => {
  return (
    <Grid container direction="column" justify="center" alignItems="center">
      <Grid item style={{ width: 219, marginTop: 50 }}>
        <LinearProgress
          variant="determinate"
          value={currentVotes - votesNeeded / 100}
          classes={{
            root: classes.rootVotesBar,
            bar: classes.votesBar
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
          >{`${currentVotes} Current votes`}</Typography>
        </Grid>
        <Grid item>
          <Typography
            className={classes.votesLabel}
          >{`${votesNeeded} Votes needed`}</Typography>
        </Grid>
      </Grid>
      <Grid item>
        <Button onClick = { handleClick }>
          VOTE
        </Button>
      </Grid>
    </Grid>
  );
};

const topFrame = (title, description) => {
  return (
    <Grid container direction="row" justify="center" alignItems="center">
      <Grid item>{getProposalHeader(title, description)}</Grid>
    </Grid>
  );
};

const midFrame = (functionName, functionArgs) => {
  return (
    <Grid
      style={{ paddingTop: 50, paddingLeft: 40, marginBottom: 50 }}
      container
      direction="column"
      justify="center"
      alignItems="flex-start"
    >
      <Grid item>
          <List subheader = { <ListSubheader> { functionName } </ListSubheader> }>
            {
              functionArgs.map((arg, i) => (
                <ListItem key = { i }>
                  <FunctionArguments
                    name = { arg.name }
                    value = { arg.value }
                  />
                </ListItem>
            ) )
            }
          </List>
      </Grid>
    </Grid>
  );
};

const ProposalDetailPage = ({
  classes,
  title,
  description,
  votesNeeded,
  currentVotes,
  functionName,
  functionArgs,
  handleClick
}) => {
  return (
    <Paper>
      <Grid container justify="center">
        <Grid
          container
          direction="column"
          justifty="flex-start"
          alignItems="flex-start"
        >
          <Grid item>{getProposalHeader(title, description)}</Grid>
          <Grid item>{midFrame(functionName, functionArgs)}</Grid>
        </Grid>
        <Grid container>{getVotesBar(classes, votesNeeded, currentVotes, handleClick)}</Grid>
      </Grid>
    </Paper>
  );
};

export default ProposalDetailPage;
