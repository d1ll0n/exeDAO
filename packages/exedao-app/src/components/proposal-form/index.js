import React, {Component, Fragment} from 'react';
import { connect } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import FunctionForm from './FunctionForm'
import { bindActionCreators } from 'redux'
import { setWeb3, cancelRequest } from '../../actions/web3'

import baseAbi from './baseAbi';
const list = [];
const parsedAbi = baseAbi.reduce((abi, funcAbi) => {
  if (funcAbi.stateMutability != 'view') {
    abi[funcAbi.name] = funcAbi;
    list.push(funcAbi.name);
  }
  return abi;
}, {});

const requirementMessages = {
  'notset': 'The approval requirement for this function is not set. To execute against this function, its approval requirement must be agreed on.',
  'basmaj': 'To be executed, proposal must have more yes than no votes by the time it is halfway expired.',
  'absmaj': 'To be executed, proposal must have approval from more than half of all shares.'
}

class ProposalForm extends Component {
  state = {
    proposalType: list[0],
    proposalInputs: [],
    proposalRequirement: 'basmaj',
    inputs: {},
  }

  /* componentWillReceiveProps = ({abi}) => {
    const {functions, functionNames} = parseAbi(abi);
    this.setState({ functions, functionNames });
  } */

  setProposalType = ({target: {value: type}}) => {
    const {inputs} = parsedAbi[type];
    this.setState({
      proposalType: type,
      proposalInputs: inputs,
      // proposalRequirement: requirement
    });
  }

  handleSubmit = (values) => console.log(values)

  renderSelect = () => <Select
    native
    value={this.state.proposalType}
    onChange={this.setProposalType}
  >
    <option value="" key='default'>Proposal Type</option>
    {list.map((proposalType, i) => <option value={proposalType} key={i}>{proposalType}</option>)}
  </Select>

  handleChange = (name, value) => this.setState({ inputs: {...this.state.inputs, [name]: value}})

  renderList = () => {
    return <List>
      <ListItem>
        <TextField
          label={`HELLO`}
          margin="normal"
          type="number"
          onChange={(d) => console.log(d.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </ListItem>
      <Divider />
      <ListItem>
        <ListItemText primary="Inbox" />
      </ListItem>
      <Divider />
      <ListItem divider>
        <ListItemText primary="Drafts" />
      </ListItem>
      <ListItem>
        <ListItemText primary="Trash" />
      </ListItem>
      <Divider light />
    </List>
  }

  renderRequirementMessage = () => {
    const {proposalType: type, proposalRequirement: requirement} = this.state;
    if (!type) return '';
    const message = requirementMessages[requirement];
    return <Fragment>
      <h4>Approval Requirement: {requirement}</h4>
      <h5 color='red'>{message}</h5>
    </Fragment>
  }

  renderInputs = () => <FunctionForm abi={parsedAbi[this.state.proposalType] || {}} onSubmit={this.handleSubmit} />

  render() {
    const {proposalType} = this.state
    return (
      <Grid container alignItems='flex-start' direction='column' justify='space-between' style={{ paddingLeft: 200 }}>
        <h2>Submit a proposal to exeDAO</h2>
        <Grid item>{this.renderSelect()}</Grid>
        <Grid item>{this.renderRequirementMessage()}</Grid>
        <Grid item>
          {this.renderInputs()}
        </Grid>
      </Grid>
    )
  }
}

const mapStateToProps = ({ web3 }) => ({
  open: web3.pending,
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      setWeb3,
      cancelRequest,
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(ProposalForm)