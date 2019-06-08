import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Typography } from '@material-ui/core';
import { number, array } from '@storybook/addon-knobs';

import AppTopBarContent from '../AppTopBarContent';
import AppMainLayout from './index';

const renderedDummyMainContent = (
  <Typography paragraph>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Rhoncus dolor purus non
    enim praesent elementum facilisis leo vel. Risus at ultrices mi tempus
    imperdiet. Semper risus in hendrerit gravida rutrum quisque non tellus.
    Convallis convallis tellus id interdum velit laoreet id donec ultrices. Odio
    morbi quis commodo odio aenean sed adipiscing. Amet nisl suscipit adipiscing
    bibendum est ultricies integer quis. Cursus euismod quis viverra nibh cras.
    Metus vulputate eu scelerisque felis imperdiet proin fermentum leo. Mauris
    commodo quis imperdiet massa tincidunt. Cras tincidunt lobortis feugiat
    vivamus at augue. At augue eget arcu dictum varius duis at consectetur
    lorem. Velit sed ullamcorper morbi tincidunt. Lorem donec massa sapien
    faucibus et molestie ac.
  </Typography>
);

const categoryName = 'AssembledComponents/AppMainLayout';

storiesOf(categoryName, module).add('MainLayout', () => {
  const handleChange = action('handleChange');

  const defaultProps = {
    handleChange,
    tabNames: array('tabNames', ['Dashboard', 'Proposals']),
    activeTabIndex: number('activeTabIndex', 0),
  };

  const topBarContent = <AppTopBarContent {...defaultProps} />;

  return (
    <AppMainLayout topBarContent={topBarContent}>
      {renderedDummyMainContent}
    </AppMainLayout>
  );
});
