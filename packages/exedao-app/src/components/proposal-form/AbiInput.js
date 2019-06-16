import React, {Component} from 'react';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField'


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
    if (type == 'bool') return <Switch
      label={name} checked={value}
      onChange={onChange}
    />;
    return <TextField
      label={`${name} (${type})`} value={value}
      margin="normal" onChange={this.handleChange}
      InputLabelProps={{ shrink: true }}
    />;
  }
}

export default AbiInput;