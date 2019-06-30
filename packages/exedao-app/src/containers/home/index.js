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

class Home extends Component {
	renderOverview = () => {
		const {classes, balance, totalShares, daoists, tokens, buyRequests, proposals} = this.props;
		return (
			<Card className={classes.overview}>
					<Grid
						container direction="column"
						justify='center' alignItems='center'
					>
						<Grid item alignItems='center'>
							<img src={ExedaoLogo} style={{ width: 200, paddingBottom: 15 }} />
						</Grid>
						<Grid item style={{width: '100%', paddingLeft: 10}}>
							<Grid container direction='row' justify='space-evenly'>
								<Grid item alignItems='flex-start' sm={5}>
									<Typography variant = "h6">Ether Balance: { balance }</Typography>
								</Grid>
								<Grid item alignItems='flex-start' sm={5}>
									<Typography variant = "h6">Total Shares: { totalShares }</Typography>
								</Grid>
								<Grid item alignItems='flex-start' sm={5}>
									<Typography variant = "h6">Daoists: { daoists.length }</Typography>
								</Grid>
								<Grid item alignItems='flex-start' sm={5}>
									<Typography variant = "h6">ERC20s Supported: { tokens.length }</Typography>
								</Grid>
								<Grid item alignItems='flex-start' sm={5}>
									<Typography variant = "h6">Applications: { buyRequests.length }</Typography>
								</Grid>
								<Grid item alignItems='flex-start' sm={5}>
									<Typography variant = "h6">Proposals: { proposals.length }</Typography>
								</Grid>
							</Grid>
						</Grid>
						<Grid item alignItems='center' style={{marginTop: 30}}>
							<Button variant='contained' color='primary'>
								Apply To Join
							</Button>
						</Grid>
				</Grid>
			</Card>
		);
	}

	render() {
		const {classes, loading, balance, totalShares, tokens} = this.props;
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
const totalValue = (ether, tokens) => ether.price * ether.count + tokens.reduce((value, token) => value += token.price * token.count, 0);

const mapStateToProps = ({ web3, exedao }) => ({
	account: web3.accounts[0],
	exedao: exedao.exedao,
	loading: web3.pending,
	balance: exedao.exedao && exedao.exedao.balance,
	totalShares: exedao.exedao && exedao.exedao.totalShares,
	tokens: exedao.exedao && exedao.exedao.tokens,
	daoists: exedao.exedao && exedao.exedao.daoists,
	buyRequests: exedao.exedao && exedao.exedao.buyRequests,
	proposals: exedao.exedao && exedao.exedao.proposals || []
});

const mapDispatchToProps = (dispatch) =>
	bindActionCreators(
		{
			goHome: () => push('/'),
		},
		dispatch,
	);

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(withStyles(styles)(Home));
