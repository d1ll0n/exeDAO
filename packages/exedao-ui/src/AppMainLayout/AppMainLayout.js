import React from 'react';
import PropTypes from 'prop-types';

import { AppBar } from '@material-ui/core';

const AppMainLayout = ({ classes, topBarContent, children }) => {
  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        {topBarContent}
      </AppBar>
      <main className={classes.content}>{children}</main>
    </div>
  );
};

export default AppMainLayout;
