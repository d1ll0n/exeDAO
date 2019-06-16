import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Route, Link } from 'react-router-dom'
import { push } from 'connected-react-router'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { requestWeb3 } from '../../actions/web3'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import WalletMaker from '../wallet/create'
import WalletLoader from '../wallet/load'
import WalletVoter from '../wallet/voting'
import Home from '../home'
import Navbar from '../navbar'
import Web3Modal from '../web3-modal'
import Proposal from '../../components/proposal-form'

const styles = theme => ({
  box: {
    marginTop: 75,
    width: '65%'
  },
  button: {
    height: 75,
    fontFamily: 'Monospace',
    fontSize: 18
  },
  link: {
    display: 'block',
    height: '100%',
    width: '100%'
  },
  home: {
    color: 'white',
    fontFamily: 'Monospace',
    fontSize: 28
  },
  title: {
    marginTop: 50,
    marginBottom: '35%',
    fontFamily: 'Monospace'
  },
  subheader: {
    marginLeft: 25,
    marginRight: 25,
    fontFamily: 'Monospace'
  },
  content: {
    marginBottom: 200
  }
})

class App extends Component {
  componentDidMount = () => {
    this.props.requestWeb3()
    this.props.goHome()
    // this.props.goProp()
  }

  renderHeader = () => <Navbar />

  renderLoading = () => (
    <div>
      <h1>Loading web3...</h1>
      <CircularProgress color="primary" />
    </div>
  )

  renderMain = () => (
    <main>
      <Web3Modal />
      <Route exact path="/" component={Home} />
      <Route exact path="/proposal-form" component={Proposal} />
      <Route exact path="/wallet/create" component={WalletMaker} />
      <Route exact path="/wallet/load" component={WalletLoader} />
      <Route exact path="/wallet/vote" component={WalletVoter} />
    </main>
  )

  render() {
    return (
      <div>
        {this.renderHeader()}
        {this.renderMain()}
      </div>
    )
  }
}

const mapStateToProps = ({ web3, wallet }) => ({
  account: web3.accounts[0],
  wallet: wallet.wallet,
  loading: web3.loading,
  loaded: web3.loaded,
  owners: wallet.owners
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      requestWeb3,
      goHome: () => push('/'),
      goProp: () => push('/proposal-form'),
      goVote: () => push('/wallet/vote')
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(App))
