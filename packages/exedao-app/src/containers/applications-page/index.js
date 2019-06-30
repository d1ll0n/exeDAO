import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'connected-react-router';
import {acceptApplication} from '../../actions/applications'

import {
  Card, CardActions, CardContent, Grid,
  Typography, Button, List, ListItem, ListItemText,
  ListSubheader, Divider, withStyles, Dialog, DialogContent, DialogActions
} from '@material-ui/core/';

import {getOpenApplications} from '../../actions/applications'
import styles from './styles';
import ApplicationDetail from '../../components/application-detail';

const details = {
  name: "Cool name",
  description: "Cooler description"
};

class ApplicationsPage extends Component {
  state = { open: false, selectedApplication: {}, loaded: false };

  loadApplications = () => {
    if (!this.props.loading && !this.state.loaded) {
      this.props.getOpenApplications();
      this.setState({loaded: true});
    }
  }

  componentDidUpdate = () => this.loadApplications();
  componentDidMount = () => this.loadApplications()

  handleGetDetails = (i) => {
    this.setState({ open: !this.state.open, selectedApplication: this.props.applications[i] });
    console.log("implement getRequestMetaData!");
  };

  handleToggle = () => {
    this.setState({ open: false });
  };

  renderApplicationDetail = () => {
    const { applicant, shares, weiTribute, tokenTributes, proposalHash } = this.state.selectedApplication;
    const { name, description } = details;
    const { isDaoist } = this.props;
    return (
      <React.Fragment>
        { this.state.selectedApplication &&
          <Dialog
            open = { this.state.open }
            onClose = { this.handleToggle }
          >
            <DialogContent>
              <ApplicationDetail
                applicant = { applicant }
                shares = { shares }
                weiTribute = { weiTribute }
                tokenTributes = { tokenTributes }
                name = { name }
                description = { description }
              />
            </DialogContent>
            <DialogActions style={{justifyContent: 'center'}}>
              {
                isDaoist && <Button onClick = { () => this.props.acceptApplication(applicant) } color="primary" >
                  Vote To Accept
                </Button>
              }
              <Button onClick = { this.handleToggle } color="secondary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        }
      </React.Fragment>        
    );
  };

  renderTokenTributes = (tokenTributes) => {
    const { classes } = this.props;
    return ( 
      tokenTributes.length > 0 && 
        <List 
          subheader = { 
            <ListSubheader inset = { true } disableSticky = { true }> Locked Tokens </ListSubheader> 
          } 
        >
        {
          tokenTributes.map((token, i) => 
            <React.Fragment key = { i }>
              <Divider />
              <ListItem>
                <ListItemText>
                  {token.symbol || `${token.tokenAddress.slice(0,10)}...`} - {token.value}
                </ListItemText>
              </ListItem>
              <Divider />
            </React.Fragment>
          )
        }
      </List>
    );
  };

  renderApplications = () => {
    const { classes, applications } = this.props;
    if (applications.length > 0) return <Grid container alignItems='flex-start' direction='row' justify='space-between'>
      { applications.map(({ applicant, shares, tokenTributes, weiTribute }, i) =>
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
                Locked Wei: { weiTribute }
              </Typography>
              <Grid item className = { classes.tokenList } >
                { this.renderTokenTributes(tokenTributes) }
              </Grid>
            </CardContent>
            <CardActions style={{ justifyContent: 'center' }}>
              <Button variant = "contained" size="small" onClick={(e) => {
                e.preventDefault()
                e.stopPropagation();
                this.handleGetDetails(i);
              }}> Learn More </Button>
            </CardActions>
          </Card>
        </Grid>
      ) }
    </Grid>
    return <Typography variant='h3' style={{width: '100%', textAlign: 'center'}}>No open applications.</Typography>
  }
  
  render() {
    const { classes } = this.props;
    const {loaded} = this.state;
    if (!loaded) return <Typography variant='h3' style={{width: '100%', textAlign: 'center'}}>Loading...</Typography>
    return (
      <Grid container spacing = { 8 } direction = "column" alignItems = "center" className = { classes.base }>
        <Grid item>
          <Button variant="contained" color='primary' size='large' onClick = {this.props.goForm}> Create Application </Button>
        </Grid>
        <Grid item>
          { this.renderApplications() }
        </Grid>
        { this.renderApplicationDetail() }
      </Grid>
    );
  }
}

const mapStateToProps = ({ web3, applications, exedao }) => ({
  account: web3.accounts[0],
  loading: web3.loading,
  isDaoist: exedao.exedao && exedao.exedao.ownedShares > 0,
  loaded: web3.loaded,
  proposals: exedao.exedao && exedao.exedao.proposals,
  applications: (exedao.exedao && exedao.exedao.applications) || []
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      acceptApplication,
      goForm: () => push('/application-form'),
      getOpenApplications,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ApplicationsPage))