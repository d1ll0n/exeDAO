import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';
import { Link } from 'react-router-dom';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { requestWeb3 } from '../../actions/web3';
import { clearStore } from '../../actions/wallet';
import { Button, CircularProgress, Grid, Typography } from '@material-ui/core';
import { unstable_Box as Box } from '@material-ui/core/Box';

class Home extends Component {
  componentDidMount = () => {
    this.props.clearStore();
  };

  render() {
    const {
      account,
      loading,
      wallet,
      owners,
      classes,
      web3,
      usingInfura,
    } = this.props;
    return (
      <Grid container alignItems="center" justify="center">
        <Box
          className={classes.box}
          color="white"
          bgcolor="#C0C0C0"
          border={1}
          fontFamily="Monospace"
          borderRadius={16}
        >
          <Grid container alignItems="center" justify="center">
            <Grid item>
              <Typography variant="h2" className={classes.title}>
                EXEdao
              </Typography>
            </Grid>
          </Grid>
          <Grid
            container
            alignItems="center"
            justify="center"
            direction="row"
            className={classes.content}
          >
            <Grid item>
              <Link to="/wallet/create" className={classes.link}>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                >
                  Create a new EXEdao
                </Button>
              </Link>
            </Grid>
            <Grid item>
              <Typography variant="h4" className={classes.subheader}>
                OR
              </Typography>
            </Grid>
            <Grid item>
              <Link to="/wallet/load">
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                >
                  Load an existing EXEdao
                </Button>
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Grid>
    );
  }
}

const mapStateToProps = ({ web3, wallet }) => ({
  account: web3.accounts[0],
  wallet: wallet.wallet,
  loading: web3.loading,
  loaded: web3.loaded,
  owners: wallet.owners,
  web3: web3.web3,
  usingInfura: web3.usingInfura,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      requestWeb3,
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
