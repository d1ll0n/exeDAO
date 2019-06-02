import React from 'react';
import PropTypes from 'prop-types';
import { Toolbar, Typography, Tabs, Tab } from '@material-ui/core';

const AppBar = ({ classes, tabNames, activeTabIndex, handleChange }) => {
  return (
    <Toolbar disableGutters className={classes.toolbar}>
      <div className={classes.logoWrapper}>
        <Typography className={classes.logo}>EXEDAO</Typography>
      </div>
      <div className={classes.tabsWrapper}>
        <Tabs
          value={activeTabIndex}
          onChange={handleChange}
          textColor="primary"
          indicatorColor="primary"
          variant="standard"
        >
          {tabNames.map((tabName, i) => (
            <Tab
              label={tabName}
              key={i}
              classes={{
                root: classes.styledTab,
                labelContainer: classes.labelContainer,
              }}
            />
          ))}
        </Tabs>
      </div>
    </Toolbar>
  );
};

AppBar.propTypes = {
  classes: PropTypes.object.isRequired,
  tabNames: PropTypes.array.isRequired,
  activeTabIndex: PropTypes.number.isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default AppBar;
