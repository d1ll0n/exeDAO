import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'connected-react-router';
import {acceptApplication} from '../../actions/applications'
import {requestWeb3} from '../../actions/web3'

import {
  Card, CardActions, CardContent, Grid,
  Typography, Button, List, ListItem, ListItemText,
  ListSubheader, Divider, withStyles, Dialog, DialogContent, DialogActions
} from '@material-ui/core/';

import {getOpenApplications, getApplicationDetails} from '../../actions/applications'
import styles from './styles';
import ApplicationDetail from '../../components/application-detail';

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
    const {applicant, metaHash} = this.props.applications[i];
    this.props.getApplicationDetails(applicant, metaHash);
    this.setState({ open: !this.state.open, selectedApplication: this.props.applications[i] });
  };

  handleToggle = () => this.setState({ open: false });

  handleAcceptApplication = (applicant) => {
    this.props.acceptApplication(applicant);
    this.handleToggle()
  }

  renderApplicationDetail = () => {
    const { applicant, shares, weiTribute, tokenTributes, proposalHash, name, description } = this.state.selectedApplication;
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
                isDaoist && <Button onClick = { () => this.handleAcceptApplication(applicant) } color="primary" >
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
      tokenTributes &&
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
    console.log(applications)
    if (applications.length > 0) return <Grid container alignItems='flex-start' direction='row' justify='space-between'>
      { applications.map(({ applicant, shares, tokenTributes, weiTribute }, i) =>
        <Grid item key = { i } className = { classes.request }>
          <Card className = { classes.card }>
            <CardContent>
              <Typography variant="title" gutterBottom>
                Applicant 
              </Typography>
              <Typography variant="caption" gutterBottom>
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

  renderLoginLink = () => <Button
    color='primary'
    variant="contained"
    size='large'
    onClick={() => this.props.requestWeb3()}
  >
    Enable Web3
  </Button>

  renderButton = () => {
    const { classes, isDaoist, loggedIn } = this.props;
    if (!loggedIn) return this.renderLoginLink();
    if (!isDaoist) return <Button variant="contained" color='primary' size='large' onClick={this.props.goForm}>Create Application</Button>
  }
  
  render() {
    const { classes } = this.props;
    const {loaded} = this.state;
    if (!loaded) return <Typography variant='h3' style={{width: '100%', textAlign: 'center'}}>Loading...</Typography>
    return (
      <Grid container spacing = { 8 } direction = "column" alignItems = "center" className = { classes.base }>
        <Grid item>
          {this.renderButton()}
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
  loggedIn: web3.loggedIn,
  proposals: exedao.exedao && exedao.exedao.proposals,
  requestWeb3,
  applications: applications.applications
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      acceptApplication,
      goForm: () => push('/application-form'),
      getOpenApplications,
      getApplicationDetails
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ApplicationsPage))