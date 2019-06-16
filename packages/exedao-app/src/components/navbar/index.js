import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';

import TabsNav from './TabsNav';
import styles from './styles';

const NavBar = ({ classes, tabNames, activeTabIndex, onChange }) => (
  <Toolbar disableGutters className={classes.toolbar}>
    <div className={classes.logoWrapper}>
      <Typography className={classes.logo}>EXEDAO</Typography>
    </div>
    <div className={classes.tabsWrapper}>
      <TabsNav
        tabNames={tabNames}
        activeTabIndex={activeTabIndex}
        onChange={onChange}
      />
    </div>
  </Toolbar>
);

NavBar.propTypes = {
  classes: PropTypes.object.isRequired,
  tabNames: PropTypes.array.isRequired,
  activeTabIndex: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(NavBar);
