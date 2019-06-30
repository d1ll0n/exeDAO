import React, { Component, Fragment } from 'react';
import ProposalContainer from 'exedao-ui/dist/ProposalContainer';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { bindActionCreators } from 'redux';
import ProposalDetail from '../../components/proposal-detail/';
import { GridList, GridListTile, Dialog, DialogContent, DialogActions, Button, Grid } from '@material-ui/core';
import { getOpenProposals, getProposalMetaData, submitVote } from '../../actions/proposals'
import Typography from '@material-ui/core/Typography';
import {requestWeb3} from '../../actions/web3'

class Proposals extends Component {
  state = { 
    selected: null,
    open: false,
    loaded: false
  }

  loadProposals = () => {
    if (!this.props.loading && !this.state.loaded) {
      this.props.getOpenProposals();
      this.setState({loaded: true});
    }
  }

  componentDidUpdate = () => this.loadProposals();

  componentDidMount = () => this.loadProposals();

  handleClick = (i) => {
    const {proposals} = this.props;
    const {proposalHash, metaHash} = proposals[i];
    this.props.getProposalMetaData(proposalHash, metaHash);
    this.setState({ selected: proposals[i].proposalHash, open: !this.state.open});
  }

  handleClose = () => {
    this.setState({open: false});
  }

  /* handleVote = () => {
    const {selected} = this.state;
    const {submitVote, proposals} = this.props;
    const proposal = selected && proposals.filter(p => p.proposalHash == selected)[0];
    submitVote(proposal.function, ...proposal.arguments)
  } */

  executeProposal = () => {
    const {selected} = this.state;
    const {exedao, proposals} = this.props;
    const proposal = selected && proposals.filter(p => p.proposalHash == selected)[0];
    exedao.sendProposal(proposal.function, 250000, 0, ...proposal.arguments).then(console.log)
  }
  
  renderProposalDetail = () => {
    const { selected, open } = this.state;
    const { proposals, isDaoist } = this.props;
    const proposal = selected && proposals.filter(p => p.proposalHash == selected)[0];
    const readyToExecute = proposal && proposal.votes && proposal.votesNeeded == 0;
    return (
      <React.Fragment>
      { selected && 
        <Dialog
          open = { open }
          keepMounted
          onClose = { this.handleClose }
          maxWidth='lg'
          ref={modal => this.modal = modal}
        >
          <DialogContent>
            <ProposalDetail proposal={proposal} />
          </DialogContent>
          <DialogActions style={{justifyContent: 'center'}}>
            {
              isDaoist && <Button onClick = { this.executeProposal } color="primary" >
                {readyToExecute ? 'Execute' : 'Vote'}
              </Button>
            }
            <Button onClick = { this.handleClose } color="secondary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      }
      </React.Fragment>
    )
  }

  renderProposals = () => {
    const {proposals} = this.props;
    if (proposals.length) return(
      <GridList cols = { 3 } spacing = { 1 } cellHeight = 'auto' style={{ padding: '25px' }}>
        {
          proposals.map((proposal, i) => 
            <GridListTile key = { i } cols = { 1 }  style = {{ width: 330}}>
              <ProposalContainer
                proposal={proposal}
                key= { i }
                onClick = { () => this.handleClick(i) }
              />
            </GridListTile>
          )
        }
      </GridList>
    );
    return <Typography variant='subtitle1'>No open proposals.</Typography>
    //this.props.proposals.map((proposal, i) => <ProposalContainer key={i} title={proposal.proposalHash} />)
  }

  renderFormLink = () => <Button
    color='primary'
    variant="contained"
    size='large'
    onClick={() => this.props.goToForm()}
  >
    Create Proposal
  </Button>

  renderLoginLink = () => <Button
    color='primary'
    variant="contained"
    size='large'
    onClick={() => this.props.requestWeb3()}
  >
    Enable Web3
  </Button>

  render() {
    const {loaded} = this.state;
    const {loggedIn} = this.props;
    if (!loaded) return <Typography variant='subtitle1'>Loading...</Typography>
    return <div style={{width: '100%'}}>
      <Grid container justify='center' direction='row' style={{marginTop: 10}}>
        <Grid item>
        { loggedIn ? this.renderFormLink() : this.renderLoginLink() }
        </Grid>
      </Grid>
      { this.renderProposals() }
      { this.renderProposalDetail() }
    </div>
  }
}

const mapStateToProps = ({exedao, web3}) => ({
  proposals: exedao.exedao ? exedao.proposals : [],
  loading: exedao.exedao == null,
  isDaoist: exedao.exedao && exedao.exedao.ownedShares > 0,
  loggedIn: web3.loggedIn,
  exedao: exedao.exedao
})

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      getProposalMetaData,
      getOpenProposals,
      goToForm: () => push('/submit-proposal'),
      requestWeb3,
      submitVote
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Proposals)