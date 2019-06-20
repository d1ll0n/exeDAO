import React, {Component} from 'react';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete'

import { thisTypeAnnotation } from '@babel/types';

const isHexOrNumeric = value => /^((0x[0-9A-Fa-f]*)|(\d*))$/.test(value);
const isFixed = value => /(-)?(0x)?[0-9A-Fa-f]+/g.test(value);

const isArray = value => /(\w+)((\[(\d*)\])*)(\[(\d*)\])/g.test(value);
const splitArr = value => {
  const [_, type, arrayIds, __, ___, last, lastCount] = /(\w+)((\[(\d*)\])*)(\[(\d*)\])/g.exec(value);
  return {type, arrayIds, lastCount}
}

class AbiInput extends Component {
  state = { 
    arrayInputs: [] 
  };

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

  handleArrayChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    console.log("handleArrayChange");
  }

  addInput = (e) => {
    e.preventDefault();
    this.setState(prevState => ({
      arrayInputs: [...prevState.arrayInputs, ""]
    }));
  }

  removeInput = (key) => (e) => {
    e.preventDefault();
    const stateCopy = this.state.arrayInputs;
    stateCopy.splice(key, 1);
    this.setState({ arrayInputs: stateCopy})
  }

  renderDynamicArray = (type) => {
    return (
      <List>
        <IconButton onClick = { this.addInput }>
          <AddIcon/>
        </IconButton>
        {
          Array(this.state.arrayInputs.length).fill(null).map((_, i) =>
            <ListItem key = { i }>
              <AbiInput
                onChange = { this.handleArrayChange }
                name = { i }
                type =  { type }
                value = { this.state.arrayInputs[i]} 
              />
              <IconButton onClick = { this.removeInput(i) }>
                <DeleteIcon/>
              </IconButton>
            </ListItem>
          )
        }
      </List>    
    );
  }

  renderStaticArray = (type, size) => {
    if (this.state.arrayInputs.length == 0) this.setState({ arrayInputs: Array.apply("", Array(size)) });
    return (
      <List>
        {
          Array(size).fill(null).map((_, i) => 
            <ListItem key = { i }>
              <AbiInput
                onChange = { this.handleArrayChange }
                name = { i }
                type = { type }
                value = { this.state.arrayInputs[i] } 
              />      
            </ListItem>
          )
        }
      </List>
    );
  }

  renderArray = (value) => {
    const {type, arrayIds, lastCount} = splitArr(value);
    if (!lastCount) return this.renderDynamicArray(type + arrayIds)
    else return this.renderStaticArray(type + arrayIds, lastCount);
  }

  render() {
    const {onChange, name, type, value} = this.props;

    if (isArray(type)) return this.renderArray(type)
    else {
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
}

export default AbiInput;