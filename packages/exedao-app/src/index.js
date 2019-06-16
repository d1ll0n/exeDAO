import React from 'react';
import { render } from 'react-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import theme from 'exedao-theme';
import store, { history } from './store';
import App from './containers/app';

import 'sanitize.css/sanitize.css';

const target = document.querySelector('#root');

render(
  <MuiThemeProvider theme={theme}>
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <div>
          <App />
        </div>
      </ConnectedRouter>
    </Provider>
  </MuiThemeProvider>,
  target,
);
