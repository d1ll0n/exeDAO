import React, { Component } from 'react';
import AppBar from 'exedao-ui/dist/AppTopBarContent';
import { Link } from 'react-router-dom';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class Navbar extends Component {
  state = {
    showForm: false,
    activeIndex: 0,
    tabs: [
      { name: 'DASHBOARD', path: '/' },
      { name: 'PROPOSALS', path: '/proposals' },
      { name: 'APPLICATIONS', path: '/applications' },
    ],
  };

  componentDidMount = () => {
    const activeIndex = this.state.tabs
      .findIndex((tab) => tab.path == window.location.pathname);
    this.setState({ activeIndex: activeIndex >= 0 ? activeIndex : 0 });
  }

  handleChangeTab = (_, index) => {
    console.log('change tab ', index)
    const { tabs } = this.state;
    this.setState({ activeIndex: index });
    if (tabs[index]) this.props.goToPage(tabs[index].path);
  };

  render() {
    const { activeIndex, tabs } = this.state;
    const tabNames = tabs.map((tab) => tab.name);
    return (
      <AppBar
        
        tabNames={tabNames}
        handleChange={this.handleChangeTab}
        activeTabIndex={activeIndex}
      />
    );
  }
}

const mapStateToProps = ({ web3 }) => ({
  web3Loaded: web3.web3,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      goToPage: (path) => push(path),
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Navbar);
