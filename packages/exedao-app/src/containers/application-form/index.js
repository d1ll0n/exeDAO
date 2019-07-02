import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { bindActionCreators } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import ArrowForward from '@material-ui/icons/ArrowForward';
import ArrowBack from '@material-ui/icons/ArrowBack';

import {submitApplication} from '../../actions/applications';
import styles from './styles';
import TokenTableForm from '../../components/token-table-form'

class BuyRequestForm extends Component {
    state = {
        page: 0,
        shares: 0,
        name: '',
        description: '',
        weiTribute: 0,
        selectedTokens: [],
    }

    handleSubmit = async () => {
        const {exedao} = this.props;
        const {name, description, selectedTokens: tokenTributes, weiTribute: eth, shares} = this.state;
        const weiTribute = parseInt(eth) * 1e18;
        const app = {name, description, tokenTributes, weiTribute, shares};
        await submitApplication(exedao, app);
        this.props.goApp()
    };


    handleRemoveToken = (index) => {
        const stateCopy = this.state.selectedTokens;
        stateCopy.splice(index, 1);
        this.setState({ selectedTokens: stateCopy });
    }

    handleAddToken = (token) => {
        const { selectedTokens } = this.state;
        this.setState({selectedTokens: [...selectedTokens, token]})
    }

    handleChangeValue = (tokenAddress, value) => {
        const { selectedTokens } = this.state;
        const stateCopy = selectedTokens.map(token => Object.assign({}, token));
        for (let token of stateCopy) { if (token.tokenAddress == tokenAddress) token.value = value; }
        this.setState({selectedTokens: stateCopy})
    }

    handleChange = (property, value) => this.setState({[property]: value})

    renderPage1 = () => <Fragment>
        <a href='https://discord.gg/qKE4zT' target='_blank'>
            Before submitting an application, we encourage you to join our Discord server.
        </a>
        <TextField
             style={{marginTop: 25}}
            placeholder="Name" value={this.state.name} type="text" variant='outlined'
            onChange={({target: {value}}) => this.handleChange('name', value)}
        />
        <Typography variant="subtitle1">Please enter your name (can be a handle or a username)</Typography>
        <TextField
            multiline line rows={5} style={{marginTop: 50, width: '80%'}} variant='outlined'
            placeholder="I want to join exeDAO because..." value={this.state.description} type="text"
            onChange={({target: {value}}) => this.handleChange('description', value)}
        />
        <Typography variant="subtitle1">Why do you want to join exeDAO?</Typography>
        <TextField
            placeholder="Shares" value={this.state.shares} type="text" variant='outlined'
            style={{marginTop: 50}}
            onChange={({target: {value}}) => this.handleChange('shares', value)}
        />
        <Typography variant="subtitle1">How many shares are you applying for?</Typography>
    </Fragment>

    renderPage2 = () => {
        const {selectedTokens, weiTribute} = this.state;
        const {tokens} = this.props;
        return (
            <Grid container alignItems = "center" direction = "column">
                <div style={{marginBottom: 20}}>
                    As a member of exeDAO, you will have the ability to vote on proposals that can move funds owned by the contract.
                    We ask that new applicants contribute to the DAO bank, though it is not required.
                    If your application is not accepted, you will be able to reclaim these funds.
                </div>
                <TextField value={weiTribute || 0}
                    onChange={({target: {value}}) => this.handleChange('weiTribute', value)}
                />
                <Typography variant="subtitle1">Ether to send with your application.</Typography>
                <TokenTableForm
                    onAddToken={this.handleAddToken}
                    onRemoveToken={this.handleRemoveToken}
                    onChangeValue={this.handleChangeValue}
                    selectedTokens={selectedTokens}
                    tokenOptions={tokens}
                />
                <Typography variant="subtitle1">Tokens to send with your application.</Typography>
            </Grid>
        );
    }

    renderPage3 = () => {
        const {name, description, selectedTokens, weiTribute, shares} = this.state;
        return (
            <Grid container direction = "column">
                <Typography variant="h6">Please confirm your application details.</Typography>
                <Typography variant="subtitle1">Name</Typography>
                <Typography variant="body1">{name}</Typography>
                <Typography variant="subtitle1">Description</Typography>
                <Typography variant="body1">{description}</Typography>
                <Typography variant="subtitle1">Shares</Typography>
                <Typography variant="body1">{shares}</Typography>
                <Typography variant="subtitle1">Ether to send</Typography>
                <Typography variant="body1">{weiTribute}</Typography>
                <Typography variant="subtitle1">Tokens to send</Typography>
                {selectedTokens.map(({symbol, value}, i) => 
                    <Typography variant="body1" key={i}>{symbol}: {value}</Typography>)}
            </Grid>
        );
    }

    renderNextButton = () => <Button
        variant='contained' size='large' color='primary'
        onClick={() => this.setState({page: this.state.page+1})}
    >
        Next <ArrowForward />
    </Button>

    renderBackButton = () => <Button
        variant='contained' size='large' color='primary'
        onClick={() => this.setState({page: this.state.page-1})}
    >
        <ArrowBack /> Previous
    </Button>

    renderTitle = () => {
        const {page} = this.state;
        let text;
        switch (page) {
            case 0: text = 'Applicant Details'; break;
            case 1: text = 'Tribute'; break;
            default: text = 'Confirmation';
        }
        return <Typography variant="h4" className={this.props.classes.title}>
            Application Form | {text}
        </Typography>
    }

    renderButtons = () => {
        const {page} = this.state;
        if (page == 0) return this.renderNextButton()
        if (page == 1) return <Fragment>
            {this.renderNextButton()}
            {this.renderBackButton()}
        </Fragment>
        return <Fragment>
            <Button
                variant='contained' size='large' color='primary'
                onClick={this.handleSubmit}
            >Submit</Button>
            {this.renderBackButton()}
        </Fragment>
    }

    renderPage = () => {
        const {page} = this.state;
        if (page == 0) return this.renderPage1();
        if (page == 1) return this.renderPage2();
        return this.renderPage3();
    }


    render() {
        const {classes} = this.props;
        return (
            <Paper className = { classes.paper }>
                {this.renderTitle()}
                <div className={classes.body}>
                    {this.renderPage()}
                </div>
                <div className={classes.actions}>
                    {this.renderButtons()}
                </div>
            </Paper>
        );
    }
};

const mapStateToProps = ({exedao}) => ({
    tokens: exedao.exedao && exedao.exedao.tokens,
    exedao: exedao.exedao
})

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
        goApp: () => push('/applications'),
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(BuyRequestForm));