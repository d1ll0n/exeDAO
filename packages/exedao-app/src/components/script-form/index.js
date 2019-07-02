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
import generatePayload, {getPayloadSource} from './generatePayload'
import styles from './styles'

class ScriptForm extends Component {
  state = {
    value: '',
    compilerOptions: {}
  }

  handleChange = e => {
    this.setState({ value: e.target.value })
  }

  handleSubmit = async () => {
    const {value} = this.state;
    const {compiler, onSubmit} = this.props;
    const compilerOptions = generatePayload(value);
    const {bytecode} = await compiler.compile(compilerOptions)
    onSubmit({bytecode: '0x' + bytecode, compilerOptions})
    this.props.onClose();
    /* const { bytecode } = easySolc(
      'Payload',
      payloadTemplate.replace('PUT_CODE_HERE', this.state.value)
    )
    this.props.onSubmit(bytecode) */
  }

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
    const {classes} = this.props;
    const {value} = this.state;
    return <TextField
      multiline={true}
      rows='15'
      label={'Payload Contract'}
      className={classes.scriptInput}
      value={getPayloadSource(value)}
      variant="outlined"
    />
  }

  render = () => {
    const {classes, show, onClose} = this.props;
    return (
      <Dialog maxWidth='lg' fullWidth open={show}>
        <DialogTitle>Script Editor</DialogTitle>
        <DialogContent>
          <Grid container direction="row" justify='space-around' style={{width: '100%'}}>
            <Grid item>{this.renderInput()}</Grid>
            <Grid item>{this.renderPreview()}</Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Grid container justify='center'>
            <Grid item>
              <Button color='primary' size='large' variant='contained' onClick={this.handleSubmit}>Compile</Button>
            </Grid>
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

export default connect(mapStateToProps)(withStyles(styles)(ScriptForm))
