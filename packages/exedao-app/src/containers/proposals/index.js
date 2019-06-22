import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'connected-react-router';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { getOpenProposals, getProposalMetaData } from '../../actions/proposals'

class Proposals extends Component {
  state = {retrievedOpen: false}

  handleGetDetails = (proposalHash, metaHash) => {
    this.props.getProposalMetaData(proposalHash, metaHash)
  }

  renderProposals = () => {
    const {proposals} = this.props;
    if (proposals.length > 0) return <Grid container alignItems='flex-start' direction='row' justify='space-between'>
      {proposals.map(({title, description, metaHash, votes, proposalHash, proposalIndex}, i) =>
        <Grid item sm key={i}>
          <Card style={{ width: '200px' }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Proposal #{proposalIndex}
              </Typography>
              {
                title && 
                <Typography variant='h6' gutterBottom>
                  {title}
                </Typography>
              }
              {
                description && 
                <Typography variant='caption'>
                  {description}
                </Typography>
              }
              <Typography variant='caption'>
                Hash: {proposalHash}
              </Typography>
              <Typography variant='caption'>
                Votes: {votes}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={(e) => {
                e.preventDefault()
                e.stopPropagation();
                this.handleGetDetails(proposalHash, metaHash)
              }}>Learn More</Button>
            </CardActions>
          </Card>
        </Grid>
      )}
    </Grid>
    return <h1>No open proposals.</h1>
  }

  setup = () => {
    // const {retrievedOpen} = this.state;
    const {loading, proposals} = this.props;
    if (!loading) {
      if (proposals.length == 0) {
        // this.setState({retrievedOpen: true})
        this.props.getOpenProposals()
      }
      else if (proposals.length > 0) {
        this.props.getProposalMetaData()
      }
    }
  }
  
  render() {
    const {loading} = this.props;
    this.setup()
    if (loading) return <h1>Loading...</h1>
    return <div>
<<<<<<< HEAD
      {this.renderProposals()}
      <Button color='secondary' onClick={() => this.props.goToForm()}>Create Proposal</Button>
=======
      { this.renderProposals() }
      { this.renderProposalDetail() }
>>>>>>> 3e679a68bbd99363feeba7046665c86a6273a431
    </div>
  }
}

const mapStateToProps = ({exedao}) => ({
  proposals: exedao.exedao ? exedao.proposals : [],
  loading: exedao.exedao == null
})

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      getProposalMetaData,
      getOpenProposals,
      goToForm: () => push('/submit-proposal')
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Proposals)