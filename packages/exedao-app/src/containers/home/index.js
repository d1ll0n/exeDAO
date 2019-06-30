import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'connected-react-router';
import {
	Typography,
	Grid,
	Card,
	Button
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import ExedaoLogo from './exedao-logo.png'
import styles from './styles';

const totalValue = (ether, tokens) => tokens.reduce((value, token) => value + (token.price || 0) * token.value, ether);

class Home extends Component {
	renderOverview = () => {
		const {classes, balance, totalShares, daoists, tokens, applications, proposals, goToForm} = this.props;
		const totalEth = totalValue(balance, tokens);
		return (
			<Card className={classes.overview}>
					<Grid
						container direction="column"
						justify='center' alignItems='center'
					>
						<Grid item>
							<img src={ExedaoLogo} style={{ width: 200, paddingBottom: 15 }} />
						</Grid>
						<Grid item style={{width: '100%', paddingLeft: 10}}>
							<Grid container direction='row' justify='space-evenly'>
								<Grid item sm={5}>
									<Typography variant = "h6">Ether Balance: { balance }</Typography>
								</Grid>
								<Grid item sm={5}>
									<Typography variant = "h6">Total Shares: { totalShares }</Typography>
								</Grid>
								<Grid item sm={5}>
									<Typography variant = "h6">Daoists: { daoists.length }</Typography>
								</Grid>
								<Grid item sm={5}>
									<Typography variant = "h6">ERC20s Supported: { tokens.length }</Typography>
								</Grid>
								<Grid item sm={5}>
									<Typography variant = "h6">Applications: { applications.length }</Typography>
								</Grid>
								<Grid item sm={5}>
									<Typography variant = "h6">Proposals: { proposals.length }</Typography>
								</Grid>
							</Grid>
						</Grid>
						<Grid item style={{marginTop: 30}}>
							<Typography variant = "h6">Total Value: ♦{totalEth}</Typography>
						</Grid>
						<Grid item style={{marginTop: 30}}>
							<Button variant='contained' color='primary' size='large' onClick={goToForm}>
								Apply To Join
							</Button>
						</Grid>
				</Grid>
			</Card>
		);
	}

	render() {
		const {classes, loading, balance, totalShares, tokens} = this.props;
		console.log(loading, totalShares, balance, tokens)
		if (loading || !totalShares || !balance) return <h1>Loading...</h1>
		return (
			<div className = { classes.base }>
				<Grid 
					container
					direction = "column"
					alignItems = "center"
				>
					<Grid item>
							{ this.renderOverview() }
					</Grid>
				</Grid>
			</div>
	);
	}
}


const mapStateToProps = ({ web3, exedao, applications }) => ({
	account: web3.accounts[0],
	exedao: exedao.exedao,
	loading: web3.pending,
	balance: exedao.exedao && exedao.exedao.balance,
	totalShares: exedao.exedao && exedao.exedao.totalShares,
	tokens: (exedao.exedao && exedao.exedao.tokens) || [],
	daoists: (exedao.exedao && exedao.exedao.daoists) || [],
	applications: (exedao.exedao && exedao.exedao.applications) || [],
	proposals: (exedao.exedao && exedao.exedao.proposals) || []
});

const mapDispatchToProps = (dispatch) =>
	bindActionCreators(
		{
			goToForm: () => push('/application-form')
		},
		dispatch,
	);

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(withStyles(styles)(Home));
