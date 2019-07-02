import React, {Fragment} from 'react';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';

import {
    Typography,
    Grid,
    Card,
    CardMedia,
  } from '@material-ui/core';

function TokenCard({token, classes}) {
    if (!token.logo && !token.price) return <Card className={classes.tokenCard}>
        <Typography variant="caption">Address: {token.tokenAddress}</Typography>
        <Typography variant="caption">Balance: {token.value}</Typography>
    </Card>
    return (
      <Card className = { classes.tokenCard }>
        <Grid container direction='row' align='center'>
            <Grid item md={3}>
                {
                    token.logo &&
                    <CardMedia component="img" image={token.logo} className={classes.tokenLogo} />
                }
            </Grid>
            <Grid item md={9}>
                <Typography variant = "subtitle1">
                    {token.name || `${token.tokenAddress.slice(0, 12)}...`}
                </Typography>
            </Grid>
        </Grid>
        <Grid container justify='center' className={classes.tokenPrice}>
            <Typography variant='subtitle1'>
                {token.value} {token.symbol} {token.price && `(♦ ${token.price})`}
            </Typography>
        </Grid>
    </Card>
    );
};

export default withStyles(styles)(TokenCard);