import React, {Component, Fragment} from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { push } from 'connected-react-router';

import Grid from '@material-ui/core/Grid'
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import { Paper } from '@material-ui/core';

import FunctionForm from './FunctionForm'
import { requestWeb3, cancelRequest } from '../../actions/web3'
import {submitProposal} from '../../actions/proposals'

const parseAbi = (abi) => {
  const functionList = [];
  const functions = {};
  for (let funcAbi of abi) {
    const {name, inputs, type, stateMutability, payable, signature} = funcAbi;
    if (type != 'function' || stateMutability == 'view') continue;
    switch(name) {
      case 'submitOrVote':
      case 'submitWithMetaHash':
      case 'burnShares':
      case 'requestShares':
      case 'closeProposal':
        continue;
      default:
        functionList.push({name, signature})
        functions[signature] = {signature, name, inputs, payable, stateMutability, type, abi: funcAbi}
    }
  }
  functionList.sort((a, b) => {
    const nameA = a.name.toLowerCase(),
      nameB = b.name.toLowerCase();
  	if (nameA > nameB) return 1;
    if (nameA < nameB) return -1;
    return 0;
  })
  return {functions, functionList}
}

class ProposalForm extends Component {
  state = {
    proposalInputs: [],
    inputs: {},
    activeFunction: '',
    title: '',
    description: '',
    includeMeta: true,
    membersOnly: false,
    showEditor: false
  }

  /* componentWillReceiveProps = ({abi}) => {
    const {functions, functionNames} = parseAbi(abi);
    this.setState({ functions, functionNames });
  } */

  handleLogin = () => this.props.requestWeb3()

  setActiveFunction = ({target: {value: sig}}) => this.setState({ activeFunction: sig });

  handleSubmit = async (values, extraMeta = {}) => {
    const {activeFunction, title, description, includeMeta, membersOnly} = this.state;
    const {functions, exedao} = this.props;
    const {abi: {name, inputs}, signature} = functions[activeFunction]
    const proposalData = {
      function: signature,
      arguments: inputs.reduce((arr, input) => [...arr, values[input.name]], []),
      title: includeMeta && title,
      description: includeMeta && description,
      ...extraMeta
    }
    console.log(`submitting proposal`)
    console.log(proposalData)
    const gas = (name == 'safeExecute') ? 500000 : 250000
    await submitProposal(exedao, proposalData, membersOnly, gas)
    this.props.goProp()
  }

  renderSelect = () => {
    const {functionList} = this.props;
    return <Select
      native
      value={this.state.activeFunction}
      onChange={this.setActiveFunction}
    >
      <option value="" key='default'>Select Function</option>
      {functionList.map((func, i) => <option value={func.signature} key={i}>{func.name}</option>)}
    </Select>
  }

  handleChange = (name, value) => this.setState({ inputs: {...this.state.inputs, [name]: value}})

  renderRequirementMessage = () => {
    const {activeFunction} = this.state;
    const {functions, totalShares} = this.props;
    if (activeFunction == '') return '';
    let {approvalRequirement: requirement, name, signature} = functions[activeFunction];
    const votesNeeded = 1 + totalShares * requirement / 100;
    requirement = +requirement;
    let message;
    if (requirement == 0) message = `The approval requirement for ${name} is not set. The function will not be callable until it is set with setApprovalRequirement(${signature}, requirement).`
    else if (requirement == 255) message = `${name} can be called by any member of the dao.`
    else message = `${name} proposals require ${votesNeeded} votes to be executed. (>${requirement}% of ${totalShares})`
    return <h4 color='red'>{message}</h4>
  }

  renderFunctionInfo = () => {
    const {activeFunction} = this.state;
    if (activeFunction == '') return '';
    const {functions} = this.props;
    const {description} = functions[activeFunction];
    if (description) return <Fragment>
      {this.renderRequirementMessage()}
      <h4>Description: {description}</h4>
    </Fragment>
  }

  toggleIncludeMeta = () => this.setState({ includeMeta: !this.state.includeMeta })
  toggleMembersOnly = () => this.setState({ membersOnly: !this.state.membersOnly })
  handleChangeTitle = ({target: {value}}) => this.setState({ title: value })
  handleChangeDescription = ({target: {value}}) => this.setState({ description: value })

  renderMetaForm = () => {
    const {title, description, includeMeta, activeFunction, membersOnly} = this.state;
    if (activeFunction == '') return ''
    return (<Fragment>
      <FormControlLabel label='Include metadata' control={
        <Switch checked={includeMeta} onChange={this.toggleIncludeMeta} />
      }/>
      <FormControlLabel label='Only visible to members' control={
        <Switch checked={membersOnly} onChange={this.toggleMembersOnly} />
      }/>
      {
        includeMeta &&
        <Grid container alignItems='flex-start' direction='column' justify='space-between' style={{ width: '100%' }}>
          <Grid item style={{ width: '50%' }}>
            <TextField style={{ width: '100%' }} onChange={this.handleChangeTitle} value={title} label='Proposal Title' />
          </Grid>
          <Grid item style={{ width: '50%' }}>
            <TextField style={{ width: '100%' }} onChange={this.handleChangeDescription} value={description} label='Proposal Description' multiline rows='6' />
          </Grid>
        </Grid>
      }
    </Fragment>)
  }

  renderForm = () => {
    const {activeFunction} = this.state;
    if (activeFunction == '') return '';
    const {functions} = this.props;
    const {abi} = functions[activeFunction]
    return <FunctionForm abi={abi || {}} onSubmit={this.handleSubmit} />
  }

  render() {
    if (!this.props.exedao) return <h1>Loading...</h1>
    if (!this.props.loggedIn) return <Paper>
      <h3>To submit a proposal, you must enable web3</h3>
      <Button onClick={this.handleLogin}>Enable Web3</Button>
    </Paper>
    if (!this.props.isDaoist) return <h1>Must be member of the dao to submit a proposal.</h1>
    return (
      <Grid container alignItems='flex-start' direction='column' justify='space-between' style={{ paddingLeft: 200 }}>
        <h2>Submit a proposal to exeDAO</h2>
        <Grid item>{this.renderSelect()}</Grid>
        <Grid item>{this.renderFunctionInfo()}</Grid>
        <Grid item style={{ width: '100%' }}>{this.renderMetaForm()}</Grid>
        <Grid item style={{ marginTop: '2%' }}>
          {this.renderForm()}
        </Grid>
      </Grid>
    )
  }
}

const mapStateToProps = ({ exedao: {exedao}, web3 }) => {
  const {functions, functionList} = exedao ? parseAbi(exedao.abi) : {functionList: [], functions: {}}
  for (let func of functionList) {
    functions[func.signature].description = exedao.functionDescriptions[func.signature];
    functions[func.signature].approvalRequirement = exedao.approvalRequirements[func.signature];
  }
  return {
    exedao,
    functions,
    functionList,
    totalShares: exedao ? exedao.totalShares : 0,
    loggedIn: web3.loggedIn,
    isDaoist: exedao && exedao.ownedShares > 0
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      requestWeb3,
      cancelRequest,
      goProp: () => push('/proposals')
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(ProposalForm)