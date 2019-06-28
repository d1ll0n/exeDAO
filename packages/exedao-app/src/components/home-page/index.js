import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';

import {
    Typography,
    Grid,
    Card,
    CardMedia,
  } from '@material-ui/core';

const totalValue = (ether, tokens) => ether.price * ether.count + tokens.reduce((value, token) => value += token.price * token.count, 0);

const renderHeader = (ether, shares, tokens, classes) => {
    return (
        <Card>
            <Grid 
                container
                direction = "column"
                className = { classes.header }
            >
                <Grid item>
                    <Typography variant = "h6">
                        Ether Balance: { ether.count }
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography variant = "h6">
                        Shares: { shares }
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography variant = "h6">
                        Total Value: ${ totalValue(ether, tokens) }
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography variant = "h6">
                        Share Value: ${ totalValue(ether, tokens) / shares}
                    </Typography>
                </Grid>
            </Grid>
        </Card>
    );
};

const renderTokens = (tokens, classes) => {
    return (
        <Grid
            container 
            justify = "center"
            spacing = { 8 }
            className = { classes.token }
        >
            {
                tokens.map((token, i) =>
                    <Grid item key = { i } className = { classes.tokenItem }>
                        <Card key = { i } className = { classes.tokenCard }>
                            <Grid container direction = 'row' align = 'center'>
                                <Grid item md={3}>
                                    <CardMedia
                                        component = "img"
                                        image = { token.logo }
                                        className={ classes.tokenLogo }
                                    />
                                </Grid>
                                <Grid item md={9}>
                                    <Typography variant = "h6">
                                        { token.name }
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Grid container justify='center' className={classes.tokenPrice}>
                                <Typography variant='h6'>
                                    {token.count} {token.name} (${token.price})
                                </Typography>
                            </Grid>
                        </Card>
                    </Grid>
                )
            }
        </Grid>
    );
};

const HomePage = ({
    classes,
    ether,
    shares,
    tokens,
}) => {
    return (
        <Grid 
            container
            direction = "column"
            alignItems = "center"
            className = { classes.base }
        >
            <Grid item>
                { renderHeader(ether, shares, tokens, classes) }
            </Grid>
            <Grid item>
                { renderTokens(tokens, classes) }
            </Grid>
        </Grid>
    );
};

export default withStyles(styles)(HomePage);