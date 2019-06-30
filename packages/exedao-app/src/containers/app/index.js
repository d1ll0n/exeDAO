import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';
import { Route, Link } from 'react-router-dom';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { requestWeb3, initWeb3 } from '../../actions/web3';
import CircularProgress from '@material-ui/core/CircularProgress';
import Home from '../home';
import Navbar from '../navbar';
import Web3Modal from '../web3-modal';
import Proposal from '../../components/proposal-form';
import Proposals from '../proposals-page';
import BuyRequestForm from '../../components/buyrequest-form'

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
      <Route exact path="/" component={Home} />
      <Route exact path="/submit-proposal" component={Proposal} /> 
      <Route exact path='/proposals' component={Proposals} />
      <Route exact path='/application-form' component={BuyRequestForm} />
    </main>
  );

  render() {
    return (
      <div>
        {/* <LoginSnack /> */}
        {this.renderHeader()}
        {this.renderMain()}     
      </div>
    );
  }
}

const mapStateToProps = ({ web3, wallet }) => ({
  account: web3.accounts[0],
  wallet: wallet.wallet,
  loading: web3.loading,
  loaded: web3.loaded,
  owners: wallet.owners,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      requestWeb3,
      initWeb3,
      goHome: () => push('/'),
      goProp: () => push('/proposals'),
      goVote: () => push('/wallet/vote'),
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(App));
