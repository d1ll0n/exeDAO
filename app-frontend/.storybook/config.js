import React from 'react';
import theme from '../src/theme';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { withKnobs } from '@storybook/addon-knobs/react';
import { configure, addDecorator } from '@storybook/react';

// automatically import all files ending in *.stories.js
const req = require.context('../stories', true, /.stories.js$/);
function loadStories() {
  req.keys().forEach((filename) => req(filename));
}

const withProviders = (story) => {
  <MuiThemeProvider theme={theme}>{story()}</MuiThemeProvider>;
};

addDecorator(withKnobs({ escapeHTML: false }));
addDecorator(withProviders);

configure(loadStories, module);
