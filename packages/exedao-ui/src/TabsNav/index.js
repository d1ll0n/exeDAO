import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Tabs, Tab } from '@material-ui/core';

import styles from './styles';

const TabsNav = ({
  classes,
  tabNames,
  handleChange,
  activeTabIndex,
  variant,
}) => {
  return (
    <Tabs
      value={activeTabIndex}
      variant={variant}
      onChange={handleChange}
      classes={{
        flexContainer: classes.flexContainer,
        indicator: classes.indicator,
      }}
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
  );
};

TabsNav.propTypes = {
  classes: PropTypes.object.isRequired,
  tabNames: PropTypes.array.isRequired,
  activeTabIndex: PropTypes.number.isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(TabsNav);
