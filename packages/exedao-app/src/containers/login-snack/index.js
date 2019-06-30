/* import React from 'react';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { requestWeb3, hideSnack } from '../../actions/web3';

function LoginSnack({ requestWeb3, loginSnack, hideSnack, loggedIn, pending }) {
  return <Snackbar
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'left'
    }}
    open={loginSnack == 1 && !loggedIn && !pending}
    autoHideDuration={12000}
    onClose={()=>hideSnack()}
    message={<span>Enable Web3 to vote!</span>}
    action={[
      <Button color='primary' size='small' onClick={() => {
        requestWeb3()
        hideSnack()
      }}>Enable</Button>
    ]}
  />
};

const mapStateToProps = ({ web3 }) => ({
  pending: web3.pending,
  loggedIn: web3.loggedIn,
  loginSnack: web3.loginSnack,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      requestWeb3,
      hideSnack
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LoginSnack);
 */