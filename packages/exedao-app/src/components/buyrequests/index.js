import React, { Component, Fragment } from 'react';

import {
  Card, CardActions, CardContent, Grid,
  Typography, Button, List, ListItem, ListItemText,
  ListSubheader, Divider, withStyles, Dialog, DialogContent
} from '@material-ui/core/';

import styles from './styles';
import BuyRequestDetail from '../buyrequest-detail';

const details = {
  name: "Cool name",
  description: "Cooler description"
};

class BuyRequests extends Component {
  state = { open: false, selectedRequest: {} };

  handleGetDetails = (i) => {
    this.setState({ open: !this.state.open, selectedRequest: this.props.buyRequests[i] });
    //this.props.getRequestMetaData(applicant, metaHash)
    console.log("implement getRequestMetaData!");
  };

  handleToggle = () => {
    this.setState({ open: false });
  };

  renderRequestDetail = () => {
    const { applicant, shares, lockedWei, lockedTokens } = this.state.selectedRequest;
    const { name, description } = details;
    return (
      <React.Fragment>
        { this.state.selectedRequest &&
          <Dialog
            open = { this.state.open }
            onClose = { this.handleToggle }
          >
            <DialogContent>
              <BuyRequestDetail
                applicant = { applicant }
                shares = { shares }
                lockedWei = { lockedWei }
                lockedTokens = { lockedTokens }
                name = { name }
                description = { description }
              />
            </DialogContent>
          </Dialog>
        }
      </React.Fragment>        
    );
  };

  renderLockedTokens = (lockedTokens) => {
    const { classes } = this.props;
    return ( 
      lockedTokens.length > 0 && 
        <List 
          subheader = { 
            <ListSubheader inset = { true } disableSticky = { true }> Locked Tokens </ListSubheader> 
          } 
        >
        {
          lockedTokens.length > 0 &&
          lockedTokens.map((token, i) => 
            <React.Fragment key = { i }>
              <Divider />
              <ListItem>
                <ListItemText>
                  { `${token.tokenAddress} - ${token.value}`}
                </ListItemText>
              </ListItem>
              <Divider />
            </React.Fragment>
          )
        }
      </List>
    );
  };

  renderRequests = () => {
    const { classes, buyRequests } = this.props;
    if (buyRequests.length > 0) return <Grid container alignItems='flex-start' direction='row' justify='space-between'>
      { buyRequests.map(({ applicant, shares, lockedWei, lockedTokens }, i) =>
        <Grid item key = { i } className = { classes.request }>
          <Card className = { classes.card }>
            <CardContent>
              <Typography variant="title" gutterBottom>
                Applicant 
              </Typography>
              <Typography variant="subheading" gutterBottom>
                { applicant }
              </Typography>
              <Typography variant='h6' gutterBottom>
                Requested Shares: { shares }
              </Typography>
              <Typography variant='h6' gutterBottom>
                Locked Wei: { lockedWei }
              </Typography>
              <Grid item className = { classes.tokenList } >
                { this.renderLockedTokens(lockedTokens) }
              </Grid>
            </CardContent>
            <CardActions style={{ justifyContent: 'center' }}>
              <Button variant = "contained" size="small" onClick={(e) => {
                e.preventDefault()
                e.stopPropagation();
                this.handleGetDetails(i);
                //console.log("Get details!")
              }}> Learn More </Button>
            </CardActions>
          </Card>
        </Grid>
      ) }
    </Grid>
    return <h1> There's No Buy Requests.</h1>
  }

  setup = () => {
    // const {retrievedOpen} = this.state;
    const { loading, buyRequests } = this.props;
    if (!loading) {
      if (buyRequests.length == 0) {
        // this.setState({retrievedOpen: true})
        //this.props.getOpenProposals()
      }
      else if (buyRequests.length > 0) {
        //this.props.getProposalMetaData()
      }
    }
  }
  
  render() {
    //this.setup()
    //if (loading) return <h1>Loading...</h1>
    const { classes } = this.props;
    return (
      <Grid container spacing = { 8 } direction = "column" alignItems = "center" className = { classes.base }>
        <Grid item>
          <Button variant = "contained" color='secondary' onClick = { console.log("Push buy request form path!") }> Create Buy Request </Button>
        </Grid>
        <Grid item>
          { this.renderRequests() }
        </Grid>
        { this.renderRequestDetail() }
      </Grid>
    );
  }
}
export default withStyles(styles)(BuyRequests)