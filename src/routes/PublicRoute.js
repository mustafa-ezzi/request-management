  import React from 'react';
  import { Route, Redirect } from 'react-router-dom';

  // This route is for public pages - redirects to app if already logged in
  const PublicRoute = ({ component: Component, ...rest }) => {
    const isAuthenticated = () => {
      // Check if user is logged in by verifying token existence
      return !!localStorage.getItem('accessToken');
    };


    return (
      <Route
        {...rest}
        render={(props) =>
          isAuthenticated() ? (
            
            // If logged in, redirect to app dashboard
            <Redirect to="/app" />
          ) : (
            // Otherwise, show the login component
            <Component {...props} />
          )
        }
      />
    );
  };

  export default PublicRoute;