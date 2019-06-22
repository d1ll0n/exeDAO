import React, { Component, Fragment } from 'react';
import ProposalContainer from 'exedao-ui/dist/ProposalContainer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getOpenProposals } from '../../actions/proposals'
import ProposalDetail from '../../components/proposal-detail/';
import { GridList, GridListTile, Dialog, DialogContent, DialogActions, Button } from '@material-ui/core';

const mockProposals = [
    {
      title: "HomeWork",
      description: "Call the fireFighters",
      votesNeeded: 75,
      currentVotes: 70,
      function: "execute order 66",
      arguments: [
            { name: "arg1", value: "0x0001234"},
            { name: "arg2", value: "69"},
            { name: "arg3", 
              value: [ 
                  {name: "", value: "O"}, 
                  {name: "", value: "M"}, 
                  {name: "", value: "G"}
              ] 
          }
      ],
      votes: { totalNeeded: 100, currentVotes: 10}
    },
    {
        title: "Should we use Lerna?",
        description: "Asking the real questions",
        votesNeeded: 75,
        currentVotes: 70,
        function: "execute order 66",
        arguments: [
              { name: "arg1", value: "0x1234"},
              { name: "arg2", value: "666"},
              { name: "arg3", 
                value: [ 
                    {name: "", value: "Lerna"}, 
                    {name: "", value: "Fucking"}, 
                    {name: "", value: "Sucks"}
                ] 
            }
        ],
        votes: { totalNeeded: 100, currentVotes: 10}
    },
    {
        title: "exeDAO rules",
        description: "Are you Lerna anything? hehehe",
        votesNeeded: 100,
        currentVotes: 50,
        function: "lowkeyDilDAO",
        arguments: [
              { name: "arg1", value: "0x1234"},
              { name: "arg2", value: "666"},
              { name: "arg3", 
                value: [ 
                    {name: "", value: "Lerna"}, 
                    {name: "", value: "Fucking"}, 
                    {name: "", value: "Sucks"}
                ] 
            }
        ],
    },
    {
      title: "Opening a meme bakery",
      description: "freshly baked memes",
      votesNeeded: 100,
      currentVotes: 100,
      function: "domo arigato mr.roboto",
      arguments: [
            { name: "arg1", value: "0x1234"},
            { name: "arg2", value: "666"},
            { name: "arg3", 
              value: [ 
                  {name: "", value: "Gash"}, 
                  {name: "", value: "Light"}
              ] 
          }
      ],
  },
  {
    title: "Opening a meme bakery",
    description: "freshly baked memes",
    votesNeeded: 100,
    currentVotes: 100,
    function: "domo arigato mr.roboto",
    arguments: [
          { name: "arg1", value: "0x1234"},
          { name: "arg2", value: "666"},
          { name: "arg3", 
            value: [ 
                {name: "", value: "Gash"}, 
                {name: "", value: "Light"}
            ] 
        }
    ],
  },
  {
    title: "Opening a meme bakery",
    description: "freshly baked memes",
    votesNeeded: 100,
    currentVotes: 100,
    function: "domo arigato mr.roboto",
    arguments: [
          { name: "arg1", value: "0x1234"},
          { name: "arg2", value: "666"},
          { name: "arg3", 
            value: [ 
                {name: "", value: "Gash"}, 
                {name: "", value: "Light"}
            ] 
        }
    ],
  },
  {
    title: "Opening a meme bakery",
    description: "freshly baked memes",
    votesNeeded: 100,
    currentVotes: 100,
    function: "domo arigato mr.roboto",
    arguments: [
          { name: "arg1", value: "0x1234"},
          { name: "arg2", value: "666"},
          { name: "arg3", 
            value: [ 
                {name: "", value: "Gash"}, 
                {name: "", value: "Light"}
            ] 
        }
    ],
  }
];

class Proposals extends Component {
  state = { 
    selected: null,
    open: false
  }

  componentDidMount = () => {
    //this.props.getOpenProposals()
  }

  handleClick = (i) => {
    this.setState({ selected: mockProposals[i], open: !this.state.open});
  }

  handleClose = () => {
    this.setState({open: false});
  }
  
  renderProposalDetail = () => {
    const { selected, open } = this.state;
    return (
      <React.Fragment>
      { selected && 
        <Dialog
          open = { open }
          keepMounted
          onClose = { this.handleToggle }
        >
          <DialogContent>
            <ProposalDetail
              title = { selected.title }
              description = { selected.description }
              votesNeeded = { selected.votesNeeded }
              currentVotes = { selected.currentVotes }
              functionName = { selected.function }
              functionArgs = { selected.arguments }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick = { this.handleClose } color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      }
      </React.Fragment>
    )
  }
  renderProposals = () => {
    return(
      <GridList cols = { 3 } spacing = { 1 } cellHeight = 'auto'>
        {
          mockProposals.map((proposal, i) => 
            <GridListTile key = { i } cols = { 1 }  style = {{ width: 330}}>
              <ProposalContainer 
                key= { i }  
                title= { proposal.title } 
                description = { proposal.description }
                votesNeeded = { proposal.votesNeeded }
                currentVotes = { proposal.currentVotes }
                functionName = { proposal.function }
                functionArgs = { proposal.arguments }
                handleClick = { () => this.handleClick(i) }
              />
            </GridListTile>
          )
        }
      </GridList>
    );

    //this.props.proposals.map((proposal, i) => <ProposalContainer key={i} title={proposal.proposalHash} />)
  }

  render() {
    return <div>
      { this.renderProposals() }
      { this.renderProposalDetail() }
    </div>
  }
}

const mapStateToProps = ({exedao}) => ({
  proposals: exedao.proposals
})

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      getOpenProposals
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Proposals)