import React, {Component} from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid'
import AbiInput from './AbiInput';
import Button from '@material-ui/core/Button';

/* const TypedInput = ({onChange, name, type, value}) => {
  let validate, fieldType = 'text';
  if (type.indexOf('uint') > 0 || type.indexOf('int') > 0) validate = isHex;
  else if (type.indexOf('fixed') > 0) validate = isFixed;
  else if (type == address > 0) validate = isHex;
  else if (type == bool > 0) fieldType = 'switch';
  const handleChange = ({target: {value: v}}) => (validate ? validate(v) : true) && onChange(v);
  switch (fieldType) {
    case 'text':
      return <TextField
        label={name} value={value}
        margin="normal" onChange={handleChange}
        InputLabelProps={{ shrink: true }}
      />;
    case 'switch':
      return <Switch
        checked={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        value={value}
      />;
    default:
      throw new Error('fuck off cunt')
  }
} */

export default class FunctionForm extends Component {
  state = {values: {}}

  componentDidMount = () => {
    const {abi: {inputs}} = this.props;
    const initial = inputs.reduce((obj, input) => ({...obj, [input.name]: ''}), {});
    this.setState({values: initial});
  }

  handleChange = (name, value) => {
    console.log('ff ', name + value)
    this.setState({values: {...this.state.values, [name]: value }})
  }

  renderInput = ({name, type}, i) => <AbiInput
    onChange={this.handleChange}
    type={type} name={name} key={i}
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
    return <Paper style={{ padding: 50 }}>
      <h3>{name}</h3>
      {this.renderInputs(inputs)}
      <Button key='submit' onClick={this.props.onSubmit}>Submit</Button>
    </Paper>
  }

}