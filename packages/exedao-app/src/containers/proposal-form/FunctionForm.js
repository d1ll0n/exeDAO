import React, {Component} from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid'
import AbiInput from './AbiInput';
import Button from '@material-ui/core/Button';

export default class FunctionForm extends Component {
  state = {values: {}}

  handleChange = (name, value) => {
    const { values } = this.state;
    this.setState({values: {...values, [name]: value }})
  }

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

  render() {
    const {abi: {name, inputs}} = this.props;
    const {values} = this.state;
    return <Paper style={{ padding: 50 }}>
      <h3>{name}</h3>
      {this.renderInputs(inputs)}
      <Button key='submit' onClick={() => this.props.onSubmit(values)}>Submit</Button>
    </Paper>
  }

}