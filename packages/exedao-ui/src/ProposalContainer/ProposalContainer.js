import React, {Component, Fragment} from 'react';
import {
	ButtonBase,
	Tooltip,
	Paper,
	Grid,
	Typography,
	LinearProgress
} from '@material-ui/core';

class ProposalDetailContainer extends Component {
	renderHeader = () => {
		const {proposal} = this.props;
		const {proposalIndex, title, description, proposalHash} = proposal;
		const displayHash = proposalHash.slice(0, 25)
		return (
			<Fragment>
				<Typography variant="h5" style={{ paddingTop: 15, paddingLeft: 40}}>Proposal #{proposalIndex}</Typography>
				<Tooltip title={proposalHash}>
					<Typography
						variant="caption"
						style={{ paddingTop: 10, paddingLeft: 40 }}
					>
					Hash: {displayHash}...
					</Typography>
				</Tooltip>
				<Grid
					style={{ paddingTop: 20, paddingLeft: 40, marginBottom: 20 }}
					container
					direction="column"
					justify="center"
					alignItems="flex-start"
				>
					{
						title && <Grid item style={{ marginBottom: 5 }}>
						<Typography variant='subtitle1'>Title:</Typography>
							<Typography variant="overline">{title}</Typography>
						</Grid>
					}
					{
						description && <Grid item style={{ marginBottom: 5 }}>
							<Typography variant='subtitle1'>Description</Typography>
							<Typography variant="overline">{description}</Typography>
						</Grid>
					}
				</Grid>
			</Fragment>
		  );
	}

	renderVotesBar = () => {
		const {classes, proposal} = this.props;
		const {votes, votesNeeded} = proposal;
		return (
			<Grid container direction="column" justify="center" alignItems="center">
				<Grid item style={{ width: 219, marginTop: 50 }}>
				<LinearProgress
					variant="determinate"
					value={votesNeeded ? (votes - votesNeeded / 100) : 0}
					classes={{
						root: classes.rootVotesBar,
						bar: classes.votesBar,
					}}
				/>
				</Grid>
				<Grid
					container
					direction="row"
					justify="space-between"
					style={{ width: 219 }}
				>
					<Grid item>
						<Typography className={classes.votesLabel}>
							{votes} Current votes
						</Typography>
					</Grid>
					<Grid item>
						<Typography className={classes.votesLabel}>
							{votesNeeded} Votes needed
						</Typography>
					</Grid>
				</Grid>
		  </Grid>
		);
	}

	render() {
		const {classes, onClick} = this.props;
		return (
			<ButtonBase onClick={onClick} className={classes.button}>
				<Paper className={classes.card}>
					<Grid container justify = "center">
						<Grid container direction = "column" justifty = "flex-start" alignItems = "flex-start">
							<Grid item> { this.renderHeader() } </Grid>
						</Grid>
						<Grid container> { this.renderVotesBar() } </Grid>
					</Grid>
				</Paper>
			</ButtonBase>
		);
	}
}

export default ProposalDetailContainer;