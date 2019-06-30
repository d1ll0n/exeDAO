import React, {Component} from 'react';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import DeleteIcon from '@material-ui/icons/Delete'

class TokenTableForm extends Component {
  state = {
    selectedToken: {},
    valueInput: 0
  }

  handleSelectToken = (token) => this.setState({selectedToken: token})

  handleAddToken = () => {
    const {selectedToken, valueInput} = this.state;
    const {onAddToken} = this.props;
    if (!selectedToken.tokenAddress || !valueInput) return;
    onAddToken({...selectedToken, value: valueInput});
    this.setState({selectedToken: {}, valueInput: 0})
  }

  renderTokenSelect = () => {
    const { classes, tokenOptions } = this.props;
    return (
      <FormControl variant="outlined" className = {classes.FormControl}>
        <InputLabel>Token</InputLabel>
        <Select
          className = { classes.select }
          value={this.state.selectedToken || ''}
          onChange = {({target: {value}}) => this.handleSelectToken(value)}
        >
          <option value=''>Add Token</option>
          {tokenOptions && tokenOptions.map((token, i) => <option value={token} key={i}>{token.symbol || token.tokenAddress.slice(0,6)}</option>)}
        </Select>
      </FormControl> 
    );
  };

  renderSelectValue = () => {
    const {valueInput} = this.state;
    return <TextField
      value={valueInput || 0}
      onChange={({target: {value}}) => this.setState({valueInput: value})}
    />
  }

  renderTokenValue = (token) => <TextField
    value={token.value}
    onChange={({target: {value}}) => this.props.onChangeValue(token.tokenAddress, value)}
  />

  render() {
    const {classes, selectedTokens, onRemoveToken} = this.props;
    return (
      <div className={classes.root}>
        <Typography variant='subtitle1'>Tokens</Typography>
        <Table>
          <TableHead>
              <TableRow>
                <TableCell style={{width: 150}}>Symbol</TableCell>
                <TableCell style={{width: 300}}>Address</TableCell>
                <TableCell style={{width: 200}}>Value</TableCell>
                <TableCell style={{width: 120}}>Actions</TableCell>
              </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
                <TableCell>{this.renderTokenSelect()}</TableCell>
                <TableCell></TableCell>
                <TableCell>{this.renderSelectValue()}</TableCell>
                <TableCell>
                  <IconButton onClick={this.handleAddToken}>
                    <AddIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            {
              selectedTokens.map(({symbol, tokenAddress, value}, i) =>
                <TableRow key={i}>
                  <TableCell>{symbol || tokenAddress.slice(0,6)}</TableCell>
                  <TableCell>{tokenAddress}</TableCell>
                  <TableCell>{this.renderTokenValue({tokenAddress, value})}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => onRemoveToken(i)}>
                        <DeleteIcon/>
                    </IconButton>
                  </TableCell>
                </TableRow>)
            }
          </TableBody>
        </Table>
      </div>
    )
  }
}

export default withStyles(styles)(TokenTableForm)