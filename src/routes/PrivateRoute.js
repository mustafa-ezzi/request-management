import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = localStorage.getItem('role');
  const routePermissions = {
    admin: [
      '/app/request',
    ],
    super_admin: [
      '/app/users',      
      '/app/request',
      '/app/zones',
      '/app/city',
      '/app/batch',

    ],
  };

  return (
    <Route
      {...rest}
      render={(props) => {
        const currentPath = props.location.pathname;

        if (!isAuthenticated) {
          return (
            <Redirect
              to={{
                pathname: '/login',
                state: { from: props.location },
              }}
            />
          );
        }

        const allowedPaths = routePermissions[role];

        // If the user's role doesn't exist in our config or the path isn't allowed
        if (!allowedPaths || !allowedPaths.includes(currentPath)) {
          const defaultRedirect = role === 'super_admin' ? '/app/users' : '/app/request';
          return <Redirect to={defaultRedirect} />;
        }

        // All good, render the component
        return <Component {...props} />;
      }}
    />
  );
};

export default PrivateRoute;
