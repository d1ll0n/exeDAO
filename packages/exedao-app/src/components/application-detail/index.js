import React from 'react';
import {
    Typography, List, ListItem,
    ListSubheader, withStyles, Paper,
    Divider
  } from '@material-ui/core/';

import styles from './styles';

const ApplicationDetail = ({
    classes,
    applicant,
    weiTribute,
    tokenTributes,
    shares,
    name,
    description,
    votes,
    votesNeeded
}) => { 
    return (
        <Paper style = {{ margin: 10 }}>
            <Typography gutterBottom>
                Name: { name }
            </Typography>
            <Typography gutterBottom>
                Description: { description }
            </Typography >
            <Typography gutterBottom>
                Applicant: { applicant }
            </Typography>
            <Typography gutterBottom>
                Shares Requested: { shares }
            </Typography>
            <Typography gutterBottom>
                Locked WEI: { weiTribute }
            </Typography>
            {
                tokenTributes.length > 0 &&
                <List className = { classes.tokenList } subheader = { <ListSubheader disableSticky = { true }> Locked Tokens </ListSubheader> }>
                    {
                        tokenTributes.map((token, i) =>
                            <React.Fragment key = { i }>
                                <Divider />
                                <ListItem>
                                    <Typography gutterBottom>
                                        Address: { token.tokenAddress }
                                    </Typography>
                                    <Typography gutterBottom>
                                        Amount: { token.value }
                                    </Typography>
                                </ListItem>
                                <Divider />
                            </React.Fragment>
                        )
                    }
                </List>
            }
        </Paper>
    );    
};


export default withStyles(styles)(ApplicationDetail);