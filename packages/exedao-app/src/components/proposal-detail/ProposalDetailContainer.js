import React, {Component, Fragment} from 'react';
import {
	Paper,
	Grid,
	Typography,
	LinearProgress
} from '@material-ui/core';

import ArgsTable from '../args-table';

class ProposalDetailContainer extends Component {
	componentWillMount() {
		document.addEventListener('mousedown', this.handleClickOutsideModal, false);
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClickOutsideModal, false);
	}

  handleClickOutsideModal = (e) => {
    if (!this.node.contains || this.node.contains(e.target)) return;
    this.onClose();
	}
	
	renderHeader = () => {
		const {proposal} = this.props;
		const {proposalIndex, title, description} = proposal;
		return (
			<Fragment>
				<Typography variant="h5" style={{ paddingTop: 15, paddingLeft: 40}}>Proposal #{proposalIndex}</Typography>
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

	renderDetails = () => {
		const {proposal} = this.props;
		const {functionSelector, parsedArgs} = proposal;
		if (!functionSelector) return <Typography variant='caption'>
			Failed to load proposal details. If you're a DAO member, try logging in.
		</Typography>
		return (
			<ArgsTable functionSelector={functionSelector} parsedArgs={parsedArgs} />
		);
	}

	renderVotesBar = () => {
		const {classes, proposal} = this.props;
		const {votes, votesNeeded} = proposal;
		return (
			<Grid container direction="column" justify="center" alignItems="center">
				<Grid item style={{ width: '80%', marginTop: 50 }}>
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
					style={{ width: '80%' }}
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
		const {classes} = this.props;
		return (
			<Paper className={classes.paper} ref={node => this.node = node}>
				<Grid container justify = "center">
					<Grid container direction = "column" justifty = "flex-start" alignItems = "flex-start">
						<Grid item> { this.renderHeader() } </Grid>
						<Grid item> { this.renderDetails() } </Grid>
					</Grid>
					<Grid container> { this.renderVotesBar() } </Grid>
				</Grid>
			</Paper>
		);
	}
}

export default ProposalDetailContainer;