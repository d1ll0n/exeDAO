import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'connected-react-router';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles';
import ExedaoLogo from './exedao-logo.svg'
import styles from './styles';
import TokenCard from '../../components/token-card'
import BurnModal from '../../components/burn-modal'

const totalValue = (ether, tokens) => tokens.reduce((value, token) => value + (token.price || 0) * token.value, ether/1e18);

class Home extends Component {
	state = {showBurn: false}
	renderApplyButton = () => <Button
		variant='contained' color='primary'
		size='large' onClick={this.props.goToForm}
	>
		Apply To Join
	</Button>

	renderBurnButton = () => <Button
		variant='contained' color='secondary'
		size='large' onClick={this.toggleShowBurn}
	>
		Burn Shares
	</Button>

	toggleShowBurn = () => this.setState({showBurn: !this.state.showBurn})

	renderOverview = () => {
		const {classes, balance, totalShares, daoists, tokens, applications, proposals, exedaoAddress, isDaoist, ownedShares} = this.props;
		const totalEth = totalValue(balance, tokens);
		return (
			<Card className={classes.overview}>
				{<BurnModal onClose={this.toggleShowBurn} open={this.state.showBurn} />}
					<Grid
						container direction="column"
						justify='center' alignItems='center'
					>
						<Grid item>
							<img src={ExedaoLogo} style={{ width: 200, paddingBottom: 15 }} />
						</Grid>
						<Grid item style={{width: '100%', paddingLeft: 10}}>
							<Typography style={{width: '100%', textAlign: 'center', marginBottom: 15}} variant='subtitle1' gutterBottom>{exedaoAddress}</Typography>
							<Grid container direction='row' justify='space-evenly'>
								<Grid item sm={5}>
									<Typography variant = "h6">Ether Balance: { balance/1e18 }</Typography>
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
									<Typography variant = "h6"><Link to='/applications'>Applications: { applications.length }</Link></Typography>
								</Grid>
								<Grid item sm={5}>
									<Typography variant = "h6"><Link to='/applications'>Proposals: { proposals.length }</Link></Typography>
								</Grid>
							</Grid>
						</Grid>
						{
							ownedShares ? <Grid item style={{marginTop: 30}}>
								<Typography variant = "h6">Your Shares: {ownedShares}</Typography>
							</Grid> : ''
						}
						<Grid item style={{marginTop: 30}}>
							<Typography variant = "h6">Total Value: ♦{totalEth}</Typography>
						</Grid>
						<Grid item style={{marginTop: 30}}>
							{isDaoist ? this.renderBurnButton() : this.renderApplyButton()}
						</Grid>
				</Grid>
			</Card>
		);
	}

	renderTokens = () => <Grid container direction='column' wrap='wrap' justify='space-between' alignItems='center'>
		{
			this.props.tokens.map((token, i) => <TokenCard token={token} key={i}/>)
		}
	</Grid>

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
					<Grid item style={{marginTop: 25}}>
						<Typography variant='h4' style={{width: '100%', textAlign: 'center', marginBottom: 25}}>Tokens</Typography>
						{this.renderTokens()}
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
	exedaoAddress: exedao.exedao && exedao.exedao.contract._address,
	isDaoist: exedao.exedao && exedao.exedao.ownedShares > 0,
	ownedShares: exedao.exedao && exedao.exedao.ownedShares,
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
