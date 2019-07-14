import React from 'react';
import PropTypes from 'prop-types';
import { Toolbar, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import TabsNav from '../TabsNav';
import ExedaoLogo from './exedao-logo.png'
import GitHubLogo from './github-logo.png'
import DiscordLogo from './discord-logo.png'
import EtherScanLogo from './etherscan-logo.png'

const AppBar = ({ classes, tabNames, activeTabIndex, handleChange, LinkComponent }) => (
  <Toolbar disableGutters className={classes.toolbar}>
    <div className={classes.logoWrapper}>
      <Link to='/'><img src={ExedaoLogo} className={classes.logo} /></Link>
      <a href='https://etherscan.io/address/0x011e3eadf19bbbce2f1327ce5dde1f49c48d9c71#code' target='_blank' className={classes.otherLogoWrapper}>
        <img src={EtherScanLogo} className={classes.otherLogo} />
      </a>
      <a href='https://github.com/d1ll0n/EXEdao' target='_blank' className={classes.otherLogoWrapper}>
        <img src={GitHubLogo} className={classes.otherLogo} />
      </a>
      <a href='https://discord.gg/6KW3XrV' target='_blank' className={classes.otherLogoWrapper}>
        <img src={DiscordLogo} className={classes.otherLogo} />
      </a>
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
