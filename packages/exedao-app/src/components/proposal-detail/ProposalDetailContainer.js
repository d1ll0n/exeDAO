import React from 'react';
import {
    Paper,
    Grid,
    Typography,
    LinearProgress
} from '@material-ui/core';


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

const getVotesBar = (classes, votesNeeded, currentVotes) => {
    return (
        <Grid container direction="column" justify="center" alignItems="center">
            <Grid item style={{ width: 219, marginTop: 50 }}>
            <LinearProgress
                variant="determinate"
                value={currentVotes - votesNeeded / 100}
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
                    >{`${currentVotes} Current votes`}</Typography>
                </Grid>
                <Grid item>
                    <Typography
                    className={classes.votesLabel}
                    >{`${votesNeeded} Votes needed`}</Typography>
                </Grid>
            </Grid>
      </Grid>
    );
  };

const topFrame = (title, description) => {
    return (
        <Grid container direction="row" justify="center" alignItems="center">
            <Grid item>
                { getProposalHeader(title, description) }
            </Grid>
        </Grid>
    );
}

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
                <Typography>
                    { functionName }
                </Typography>
                {
                    functionArgs.map((arg, i) =>
                        <Typography>
                            { arg.name }    
                        </Typography>
                    )
                }
            </Grid>
        </Grid>
    );
}

const ProposalDetailContainer = ({
    classes,
    title,
    description,
    votesNeeded,
    currentVotes,
    functionName,
    functionArgs
}) => {
    return (
        <Paper>
            <Grid container justify = "center">
                <Grid container direction = "column" justifty = "flex-start" alignItems = "flex-start">
                    <Grid item>
                        { getProposalHeader(title, description) }
                    </Grid>
                    <Grid item>
                        { midFrame(functionName, functionArgs) }
                    </Grid>
                </Grid>
                <Grid container>
                    { getVotesBar(classes, votesNeeded, currentVotes) }
                </Grid>
            </Grid>

        </Paper>
    );
}

export default ProposalDetailContainer;