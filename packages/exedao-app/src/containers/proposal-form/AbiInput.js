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

  isValid = (value) => {
    const {type} = this.props;
    if (['int', 'address'].some(t => type.indexOf(t) > -1)) return isHexOrNumeric(value);
    else if (type.indexOf('fixed') > 0) return isFixed(value);
    return true;
  }

  handleChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    const {target: {value}} = e;
    const {onChange, name} = this.props;
    if (this.isValid(value)) onChange(name, value)
  }

  handleArrayChange = (index, newValue) => {
    const {value, onChange, name: thisName} = this.props;
    const stateCopy = [...value]
    stateCopy[index] = newValue;
    onChange(thisName, stateCopy);
  }

  handleTupleChange = (name, newValue) => {
    const {value, onChange, name: thisName} = this.props;
    const tupleInputs = {...value, [name]: newValue}
    onChange(thisName, tupleInputs);
  }

  addInput = (e) => {
    e.preventDefault();
    const {value, onChange, name} = this.props;
    onChange(name, [...value, ''])
  }

  removeInput = (key) => (e) => {
    e.preventDefault();
    const {value, onChange, name} = this.props;
    const stateCopy = [...value];
    stateCopy.splice(key, 1);
    onChange(name, stateCopy)
  }

  renderDynamicArray = (type) => {
    const {value, onChange, name} = this.props;
    if (!value) {
      onChange(name, []);
      return '';
    }
    
    return (
      <List>
        <IconButton onClick = { this.addInput }>
          <AddIcon/>
        </IconButton>
        {
          Array(value.length).fill(null).map((_, i) =>
            <ListItem key = { i }>
              <AbiInput
                onChange = { this.handleArrayChange }
                name = { i }
                type =  { type }
                value = { value[i] || '' } 
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
    const {value, onChange, name} = this.props;
    if (!value) {
      onChange(name, Array.apply("", Array(size)));
      return '';
    }
    return (
      <List>
        {
          Array(size).fill(null).map((_, i) => 
            <ListItem key = { i }>
              <AbiInput
                onChange = { this.handleArrayChange }
                name = { i }
                type = { type }
                value = { value[i] || '' } 
              />      
            </ListItem>
          )
        }
      </List>
    );
  }

  renderComponents = (components) => {
    const {value, onChange, name: thisName} = this.props;
    if (!value) {
      onChange(thisName, components.reduce((obj, comp) => ({...obj, [comp.name]: ""}), {}))
      return ''
    }
    
    return (
      <List>
        {
          components.map(({name, type}, i) => 
            <ListItem key = { i }>
              <AbiInput
                onChange = { this.handleTupleChange }
                name = { name }
                type = { type }
                value = { value[name] || ''} 
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
    const {onChange, name, type, components, value} = this.props;
    if (isArray(type)) {
      return (
        <FormControlLabel
        label={`${name} ( ${type} )`} control={<div>{this.renderArray(type)}</div>}/>
      )
    } 
    if (type == 'tuple') return this.renderComponents(components)
    if (type == 'bool') return <FormControlLabel
      label={`${name} (${type})`} control={
        <Switch
          label={`${name} (${type})`} checked={value}
          onChange={() => onChange(name, !value)}
        />
    }/>;
    return <TextField
      label={`${name} (${type})`} value={value || ''}
      margin="normal" onChange={this.handleChange}
      InputLabelProps={{ shrink: true }}
    />;
  }
}

export default AbiInput;