import React, {Component} from 'react';
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import DialogTitle from '@material-ui/core/DialogTitle';

class BurnModal extends Component {
  state = {value: 0}

  handleChange = ({target: {value}}) => this.setState({value})

  handleSubmit = async () => {
    const {exedao} = this.props;
    const {value} = this.state;
    await exedao.burnShares(value, 150000)
    this.props.onClose();
  }

  render() {
    const {open} = this.props;

    return (
      <Dialog open={open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Burn Shares</DialogTitle>
        <DialogContent>
          <TextField style={{marginTop: 25}} onChange={this.handleChange} value={this.state.value} variant='outlined' label='Shares To Burn' />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleSubmit} color="secondary">
            Burn
          </Button>
          <Button onClick={this.props.onClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

const mapStateToProps = ({ exedao }) => ({
  exedao: exedao.exedao,
})

export default connect(mapStateToProps)(BurnModal)