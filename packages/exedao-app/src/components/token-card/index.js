import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';

import {
    Typography,
    Grid,
    Card,
    CardMedia,
  } from '@material-ui/core';

function TokenCard({token, classes}) {
    return (
      <Card className = { classes.tokenCard }>
        <Grid container direction='row' align='center'>
            <Grid item md={3}>
                <CardMedia
                    component="img"
                    image={token.logo}
                    className={classes.tokenLogo}
                />
            </Grid>
            <Grid item md={9}>
                <Typography variant = "h6">
                    {token.name}
                </Typography>
            </Grid>
        </Grid>
        <Grid container justify='center' className={classes.tokenPrice}>
            <Typography variant='h6'>
                {token.value} {token.name} (♦{token.price})
            </Typography>
        </Grid>
    </Card>
    );
};

export default withStyles(styles)(TokenCard);