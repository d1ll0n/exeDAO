import React, {Component} from 'react';
import NavBar from '../../components/navbar';

import { push } from 'connected-react-router'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

class Navbar extends Component {
  state = {
    showForm: false,
    activeIndex: 0,
    tabs: [
      { name: 'DASHBOARD', path: '/' },
      { name: 'PROPOSALS', path: '/proposals' }
    ]
  }

  handleChangeTab = (_, index) => {
    const {activeIndex, tabs} = this.state;
    if (index !== activeIndex) {
      this.setState({ activeIndex: index })
      const {path} = tabs[index];
      this.props.goToPage(path);
    }
  }

  render() {
    const {activeIndex, tabs} = this.state;
    const tabNames = tabs.map(tab => tab.name);
    return <NavBar
      tabNames={tabNames}
      onChange={this.handleChangeTab}
      activeTabIndex={activeIndex}
    />
  }
}

const mapStateToProps = ({ web3 }) => ({
  web3Loaded: web3.web3
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      goToPage: (path) => push(path),
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Navbar)
