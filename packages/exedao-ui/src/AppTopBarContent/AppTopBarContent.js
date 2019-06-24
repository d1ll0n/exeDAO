import React from 'react';
import PropTypes from 'prop-types';
import { Toolbar, Typography } from '@material-ui/core';
import TabsNav from '../TabsNav';
import ExedaoLogo from './exedao-logo.png'

const AppBar = ({ classes, tabNames, activeTabIndex, handleChange }) => (
  <Toolbar disableGutters className={classes.toolbar}>
    <div className={classes.logoWrapper}>
      <img src={ExedaoLogo} className={classes.logo} />
    </div>
    <div className={classes.tabsWrapper}>
      <TabsNav
        tabNames={tabNames}
        activeTabIndex={activeTabIndex}
        handleChange={handleChange}
      />
    </div>
  </Toolbar>
);

AppBar.propTypes = {
  classes: PropTypes.object.isRequired,
  tabNames: PropTypes.array.isRequired,
  activeTabIndex: PropTypes.number.isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default AppBar;
