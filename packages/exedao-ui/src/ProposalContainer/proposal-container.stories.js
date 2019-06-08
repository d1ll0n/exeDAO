import React from 'react';
import { storiesOf } from '@storybook/react';
import { text, number } from '@storybook/addon-knobs';

import ProposalContainer from './index';

const categoryName = 'AssembledComponents/ProposalContainer';

storiesOf(categoryName, module).add('Proposal Container', () => {
  const defaultProps = {
    title: text('title', 'Proposal Name'),
    creationDate: text('creationDate', '06/04/2019'),
    timeLeft: text('timeLeft', '4:55:07'),
    shares: number('shares', 100),
    tribute: number('tribute', 517),
    yesVotes: number('yesVotes', 70),
    noVotes: number('noVotes', 35),
  };

  return <ProposalContainer {...defaultProps} />;
});
