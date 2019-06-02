import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { array, number } from '@storybook/addon-knobs';

import AppBar from './index';

const categoryName = 'AssembledComponents/AppBar';

storiesOf(categoryName, module).add('AppBar', () => {
  const handleChange = action('handleChange');

  const defaultProps = {
    handleChange,
    tabNames: array('tabNames', ['Dashboard', 'Proposals']),
    activeTabIndex: number('activeTabIndex', 0),
  };

  return (
    <div
      style={{ paddingTop: '20px', height: '100vh', backgroundColor: 'gray' }}
    >
      <AppBar {...defaultProps} />
    </div>
  );
});
