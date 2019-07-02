import React, {Component, Fragment} from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid'
import AbiInput from './AbiInput';
import Button from '@material-ui/core/Button';
import ScriptForm from '../../components/script-form';

export default class FunctionForm extends Component {
  state = {values: {}, showEditor: false, metadata: null}

  handleChange = (name, value) => {
    const { values } = this.state;
    this.setState({values: {...values, [name]: value }})
  }

  handleToggleEditor = () => this.setState({showEditor: !this.state.showEditor});

  renderInput = ({name, type, components}, i) => <AbiInput
    onChange={this.handleChange}
    type={type} name={name} key={i}
    components={components}
    value={this.state.values[name]}
  />

  renderInputs = (inputs) => <Grid container
    direction='row' wrap='nowrap'
    alignItems='flex-start' alignContent='flex-start'
    justify='space-between' style={{width: 600}}>
    { inputs.map((input, i) => this.renderInput(input, i)) }
  </Grid>

  handleSubmitScript = ({bytecode, compilerOptions}) => {
    this.setState({
      values: {bytecode},
      metadata: compilerOptions
    })
  }

  renderEditor = () => {
    const {abi: {name}} = this.props;
    const {showEditor} = this.state;
    if (name == 'safeExecute') return <Fragment>
      <ScriptForm show={showEditor} onSubmit={this.handleSubmitScript} onClose={this.handleToggleEditor} />
      <Button key='submit' variant='contained' color='primary' onClick={this.handleToggleEditor}>View Script Editor</Button>
    </Fragment>
    return '';
  }

  render() {
    const {abi: {name, inputs}} = this.props;
    const {values, metadata} = this.state;
    return <Paper style={{ padding: 50 }}>
      <h3>{name}</h3>
      {this.renderEditor()}
      {this.renderInputs(inputs)}
      <Button key='submit' variant='contained' color='primary' onClick={() => this.props.onSubmit(values, metadata)}>Submit</Button>
    </Paper>
  }

}