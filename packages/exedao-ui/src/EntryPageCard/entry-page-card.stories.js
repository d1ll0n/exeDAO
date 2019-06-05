import React from 'react';
import { storiesOf } from '@storybook/react';
import { text, number, boolean } from '@storybook/addon-knobs';

import EntryPageCard from './index';

const categoryName = 'AssembledComponents/EntryPageCard';

storiesOf(categoryName, module).add('Entry Page Card', () => {
  const defaultProps = {
    title: text('title', '57'),
    subheader: text('subheader', 'Members'),
  };

  return <EntryPageCard {...defaultProps} />;
});
