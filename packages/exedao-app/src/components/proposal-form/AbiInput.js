import React, {Component} from 'react';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel';

const isHexOrNumeric = value => /^((0x[0-9A-Fa-f]*)|(\d*))$/.test(value);
const isFixed = value => /(-)?(0x)?[0-9A-Fa-f]+/g.test(value);

/* const isArray = value => /(\w+)((\[(\d*)\])+)/g.test(value);
const splitArr = value => {
  const [_, type, arrLength] = /^(.+)(?:\[(\d*)\])$/g.exec(value);
  return {type, arrLength}
} */

class AbiInput extends Component {
  handleChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    const {target: {value}} = e;
    const {onChange, name} = this.props;
    if (this.isValid(value)) onChange(name, value)
  }

  isValid = (value) => {
    const {type} = this.props;
    if (['int', 'address'].some(t => type.indexOf(t) > -1)) return isHexOrNumeric(value);
    else if (type.indexOf('fixed') > 0) return isFixed(value);
    return true;
  }

  render() {
    const {onChange, name, type, value} = this.props;
    if (type == 'bool') return <FormControlLabel
      label={`${name} (${type})`} control={
        <Switch
          label={`${name} (${type})`} checked={value}
          onChange={() => onChange(name, !value)}
        />
      }/>;
    return <TextField
      label={`${name} (${type})`} value={value}
      margin="normal" onChange={this.handleChange}
      InputLabelProps={{ shrink: true }}
    />;
  }
}

export default AbiInput;