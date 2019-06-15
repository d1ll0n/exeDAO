import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import allRoutes from './client/routes';
import Layout from './client/shared/containers/Layout';

const getRoutes = (routes) =>
  routes.map((route) => {
    const { key, path, exact, children, component: Component } = route;

    return (
      <Route
        key={key}
        path={path}
        exact={exact}
        render={(props) => (
          <Component {...props}>
            {children.length ? getRoutes(children) : null}
          </Component>
        )}
      />
    );
  });

const App = () => {
  const routes = getRoutes(allRoutes);

  return (
    <BrowserRouter>
      <div className="appContainer">
        <Switch>
          <Route
            path="/"
            render={(props) => <Layout {...props}>{routes}</Layout>}
          />
        </Switch>
      </div>
    </BrowserRouter>
  );
};

export default App;
