import React from 'react';
import { storiesOf } from '@storybook/react';
import { text, number } from '@storybook/addon-knobs';

import ProposalContainer from './index';

const categoryName = 'AssembledComponents/ProposalContainer';

storiesOf(categoryName, module).add('Proposal Container', () => {
  const defaultProps = {
    title: text('title', 'Proposal Name'),
    description: text('description', 'something cool'),
    function: text('function', 'doSomething'),
    votesNeeded: number('votesNeeded', 70),
    currentVotes: number('currentVotes', 35),
  };

  return <ProposalContainer {...defaultProps} />;
});
