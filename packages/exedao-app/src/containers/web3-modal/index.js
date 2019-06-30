import React, {Component} from 'react';
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Grid from '@material-ui/core/Grid'
import DialogTitle from '@material-ui/core/DialogTitle';
import Tooltip from '@material-ui/core/Tooltip';
import { bindActionCreators } from 'redux'
import { initWeb3, cancelRequest } from '../../actions/web3'

import fortmaticLogo from './fortmatic.png';
import metamaskLogo from './metamask.png'
import torusLogo from './torus.svg'

class Web3Modal extends Component {
  handleSelectProvider = async (name) => {
    if (name == 'torus') await this.importTorus();
    if (name == 'fortmatic') await this.importFortmatic();
    if (window.ethereum) await window.ethereum.enable();
    await new Promise(resolve => setTimeout(resolve, 500));
    this.props.initWeb3();
  }

  importTorus = async () => {
    window.web3 = {};
    window.ethereum = null;
    await import("@toruslabs/torus-embed")
  };

  importFortmatic = async () => {
    window.web3 = {};
    window.ethereum = null;
    const {default: Fortmatic} = await import('fortmatic');
    const fm = new Fortmatic('pk_live_C2BA642EDBC1C577');
    const provider = fm.getProvider();
    window.web3 = {currentProvider: provider};
  }

  render() {
    const {open} = this.props;

    return (
      <div>
        <Dialog open={open} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Enable Web3</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You must enable web3 to submit proposals.
            </DialogContentText>
            <Grid container alignItems='center' direction='row' justify='space-between'>
              
              <Grid item>
                <Tooltip title='Log in with phone number'>
                  <Button onClick={() => this.handleSelectProvider('fortmatic')}>
                    <img src={fortmaticLogo} style={{ width: '75px' }} />
                  </Button>
                </Tooltip>
              </Grid>

              <Grid item>
                <Tooltip title='Log in with web extension'>
                  <Button onClick={() => this.handleSelectProvider('metamask')}>
                    <img src={metamaskLogo} style={{ width: '75px' }} />
                  </Button>
                </Tooltip>
              </Grid>

              <Grid item>
                <Tooltip title='Log in with Google'>
                  <Button onClick={() => this.handleSelectProvider('torus')}>
                    <img src={torusLogo} style={{ width: '75px' }} />
                  </Button>
                </Tooltip>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.props.cancelRequest} color="primary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

const mapStateToProps = ({ web3 }) => ({
  open: web3.pending,
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      initWeb3,
      cancelRequest,
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Web3Modal)