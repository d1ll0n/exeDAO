import 'react-contexify/dist/ReactContexify.min.css';

import React from 'react';
import theme from 'exedao-theme';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { withKnobs } from '@storybook/addon-knobs/react';
import { configure, addDecorator } from '@storybook/react';

const req = require.context('../src', true, /.stories.js$/);
function loadStories() {
  req.keys().forEach((filename) => req(filename));
}

const withProviders = (story) => (
  <MuiThemeProvider theme={theme}>{story()}</MuiThemeProvider>
);

addDecorator(withKnobs({ escapeHTML: false }));
addDecorator(withProviders);

configure(loadStories, module);
