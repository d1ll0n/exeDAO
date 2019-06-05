import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { array, number } from '@storybook/addon-knobs';

import TabsNav from './index';

const categoryName = 'AssembledComponents/Navigation';

storiesOf(categoryName, module).add('TabsNav', () => {
  const handleChange = action('handleChange');

  const defaultProps = {
    tabNames: array('tabNames', ['In Process', 'Expired', 'Completed']),
    handleChange,
    activeTabIndex: number('activeTabIndex', 0),
  };

  return (
    <div style={{ width: 400 }}>
      <TabsNav {...defaultProps} />
    </div>
  );
});
