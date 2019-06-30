import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';
import { Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { initWeb3 } from '../../actions/web3';
import CircularProgress from '@material-ui/core/CircularProgress';
import Home from '../home';
import Navbar from '../navbar';
import Web3Modal from '../web3-modal';
import ProposalForm from '../proposal-form';
import ProposalsPage from '../proposals-page';
import ApplicationForm from '../application-form'
import ApplicationsPage from '../applications-page';

class App extends Component {
  componentDidMount = () => {
    this.props.initWeb3();
  };

  renderHeader = () => <Navbar />;

  renderLoading = () => (
    <div>
      <h1>Loading web3...</h1>
      <CircularProgress color="primary" />
    </div>
  );

  renderMain = () => (
    <main>
      <Web3Modal />
      <Route exact path='/' component={Home} />
      <Route exact path='/proposals' component={ProposalsPage} />
      <Route exact path='/applications' component={ApplicationsPage} />
      <Route exact path='/application-form' component={ApplicationForm} />
      <Route exact path='/proposal-form' component={ProposalForm} /> 
    </main>
  );

  render() {
    return (
      <div>
        {this.renderHeader()}
        {this.renderMain()}     
      </div>
    );
  }
}

const mapStateToProps = ({ web3 }) => ({
  account: web3.accounts[0],
  loading: web3.loading,
  loaded: web3.loaded,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      initWeb3,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(App));
