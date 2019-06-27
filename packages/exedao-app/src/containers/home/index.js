import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { clearStore } from '../../actions/wallet';
import HomePage from '../../components/home-page';

class Home extends Component {

  render() {
    const {loading, balance, totalShares} = this.props;
    console.log({loading, balance, totalShares})
    if (loading || !totalShares || !balance) return <h1>Loading...</h1>
    return (
      <HomePage ether={{ price: 1, count: balance }} tokens={[{ name: 'DAI', price: 2, count: 100000, logo: 'https://global-uploads.webflow.com/5cb0ac9c57054973ac1bf1e4/5cd058497473d12cf9a5025b_1518.png' }]} shares={totalShares} />
    );
  }
}

const mapStateToProps = ({ web3, exedao }) => ({
  account: web3.accounts[0],
  exedao: exedao.exedao,
  loading: web3.pending,
  balance: exedao.exedao && exedao.exedao.balance,
  totalShares: exedao.exedao && exedao.exedao.totalShares
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      goHome: () => push('/'),
      goVote: () => push('/wallet/vote'),
      clearStore,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(Home));
