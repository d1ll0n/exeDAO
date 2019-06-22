import React, { Component, Fragment } from 'react';
import ProposalCard from 'exedao-ui/dist/ProposalCard';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getOpenProposals } from '../../actions/proposals'

class Proposals extends Component {
  componentDidMount = () => {
    this.props.getOpenProposals()
  }

  renderProposals = () => <Fragment>
    {
      this.props.proposals.map((proposal, i) => <ProposalCard key={i} title={proposal.proposalHash} timeLeft={0} />)
    }
  </Fragment>

  render() {
    return <div>
      {this.renderProposals()}
    </div>
  }
}

const mapStateToProps = ({exedao}) => ({
  proposals: exedao.proposals
})

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      getOpenProposals
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Proposals)