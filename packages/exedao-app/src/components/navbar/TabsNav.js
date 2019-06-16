import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import styles from './tabStyles';

const TabsNav = ({
  classes,
  tabNames,
  onChange,
  activeTabIndex,
  variant,
}) => {
  return (
    <Tabs
      value={activeTabIndex}
      variant={variant}
      onChange={onChange}
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
  onChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(TabsNav);
