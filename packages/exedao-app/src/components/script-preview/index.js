import React, { Component } from 'react'
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'
import styles from './styles'

class ScriptPreview extends Component {
  renderInput = () => {
    const {classes} = this.props;
    return (<Grid container direction="column">
      <TextField
        multiline={true}
        rows='15'
        label={'Solidity Script'}
        className={classes.scriptInput}
        value={this.state.value}
        variant="outlined"
        onChange={this.handleChange}
      />
    </Grid>)
  }

  renderPreview = () => {
    const {classes, script} = this.props;
    return <TextField
      multiline={true}
      rows='15'
      label={'Payload Contract'}
      className={classes.scriptInput}
      value={script}
      variant="outlined"
    />
  }

  render = () => {
    const {show, onClose} = this.props;
    return (
      <Dialog maxWidth='md' open={show}>
        <DialogTitle>Script Preview</DialogTitle>
        <DialogContent>
          {this.renderPreview()}
        </DialogContent>
        <DialogActions>
          <Grid container justify='center'>
            <Grid item>
              <Button color='secondary' size='large' variant='contained' onClick={onClose}>Close</Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>);
  }
}

const mapStateToProps = ({ exedao }) => ({
  compiler: exedao.exedao && exedao.exedao.compiler
});

export default connect(mapStateToProps)(withStyles(styles)(ScriptPreview))
