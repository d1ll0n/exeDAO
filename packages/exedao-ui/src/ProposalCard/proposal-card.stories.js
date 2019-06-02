import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { text, number, boolean } from '@storybook/addon-knobs';

import ProposalCard from './index';

const categoryName = 'AssembledComponents/ProposalCard';

storiesOf(categoryName, module).add('Proposal Card', () => {
  const onClick = action('onClick');

  const defaultProps = {
    onClick,
    title: text('Title', 'Proposal One'),
    creationDate: text('CreationDate', '6/1/2019'),
    timeLeft: text('TimeLeft', '5:00:00'),
    shares: number('Shares', 50),
    tribute: number('tribute', 500),
  };

  return <ProposalCard {...defaultProps} />;
});
