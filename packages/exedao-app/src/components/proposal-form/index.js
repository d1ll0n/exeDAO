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

const details = {
  mintShares: {
    requirement: 'Basic Majority',
    inputs: [
      { name: 'receiver', type: 'address' },
      { name: 'shares', type: 'uint256' },
      { name: 'shares', type: 'uint256' }
    ]
  }
}

const list = ['mintShares']

const requirementMessages = {
  'Basic Majority': 'To be executed, proposal must have more yes than no votes by the time it is halfway expired.',
  'Absolute Majority': 'To be executed, proposal must have approval from more than half of all shares.'
}

const abi = {
  "constant": false,
  "inputs": [{ "name": "wallet", "type": "address" }, { "name": "wallet2", "type": "uint256" }],
  "name": "addWalletAddress",
  "outputs": [],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
}

// const TypeInput = ({})

class ProposalForm extends Component {
  state = {
    proposalType: null,
    proposalInputs: [],
    proposalRequirement: null,
    inputs: {}
  }

  setProposalType = ({target: {value: type}}) => {
    const {requirement, inputs} = details[type];
    this.setState({
      proposalType: type,
      proposalInputs: inputs,
      proposalRequirement: requirement
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

  /* renderInputs = () => <Grid container
    direction='row' wrap={false}
    alignItems='flex-start' alignContent='flex-start'
    justify='space-between' style={{width: 600}}>
    {
      this.state.proposalInputs
        .map((inputDef, i) => <TextField
          key={i}
          label={`${inputDef.name} (${inputDef.type})`}
          value={this.state[inputDef.name]}
          onChange={(e) => this.handleChange(inputDef.name, e.target.value)}
          margin="normal"
          variant="filled"
        />)
    }
  </Grid> */

  renderInputs = () => <FunctionForm abi={abi} onSubmit={this.handleSubmit} />

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