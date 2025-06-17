import React, { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect, useHistory } from 'react-router-dom';
import AccessibleNavigationAnnouncer from './components/AccessibleNavigationAnnouncer';
import PublicRoute from './routes/PublicRoute';
import PrivateRoute from './routes/PrivateRoute';
import { Toaster } from 'react-hot-toast';
import { ModalProvider, useModal } from './context/ModalContext';
import { get } from '../src/api/axios'; // ✅ ensure the path is correct

// Loading spinner for Suspense and fetch
const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-full h-screen">
    <div className="w-16 h-16 border-4 border-purple-600 border-solid rounded-full border-t-transparent animate-spin"></div>
  </div>
);

const Layout = lazy(() => import('./containers/Layout'));
const Login = lazy(() => import('./pages/Login'));
const CreateAccount = lazy(() => import('./pages/CreateAccount'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Registration = lazy(() => import('./pages/registration'));
const RegistrationHistory = lazy(() => import('./pages/RegistrationsHistory'));
const Tables = lazy(() => import('./pages/Tables'));

function App() {
  return (
    <ModalProvider>
      <Router>
        <AccessibleNavigationAnnouncer />
        <Suspense fallback={<LoadingSpinner />}>
          <AppInitializer />
          <Toaster
            position="top-right"
            toastOptions={{
              success: {
                style: {
                  background: 'linear-gradient(to right, #0D9488, #10B981)',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: 500,
                  padding: '10px 16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
                iconTheme: {
                  primary: 'white',
                  secondary: '#0D9488',
                },
              },
              error: {
                style: {
                  background: 'linear-gradient(to right, #DC2626, #EF4444)',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: 500,
                  padding: '10px 16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
                iconTheme: {
                  primary: 'white',
                  secondary: '#DC2626',
                },
              },
              loading: {
                style: {
                  background: 'linear-gradient(to right, #1F2937, #374151)',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: 500,
                  padding: '10px 16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
              },
              duration: 4000,
            }}
          />
        </Suspense>
      </Router>
    </ModalProvider>
  );
}

function AppInitializer() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setCheckingAuth(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await get('/users/me/');
        setIsAuthenticated(true);
        
      if (response?.role) {
        localStorage.setItem("role", response.role);
      }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.clear();
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyUser();
  }, []);

  if (checkingAuth) {
    return <LoadingSpinner />;
  }

  return <AppContent isAuthenticated={isAuthenticated} />;
}

function AppContent({ isAuthenticated }) {
  const history = useHistory();
  const { clearModalState } = useModal();

  useEffect(() => {
    const featurePaths = [
      '/app/miqaat-menu/',
      '/app/miqaat-attendance/',
      '/app/counter-packing/',
      '/app/distribution/',
      '/app/leftover-degs/',
    ];

    const unlisten = history.listen((newLocation) => {
      const currentPath = history.location.pathname;
      const newPath = newLocation.pathname;

      const isCurrentPageFeatureOrTables =
        currentPath.includes('/app/tables') ||
        featurePaths.some(path => currentPath.includes(path));

      const isNavigatingToFeaturePage = featurePaths.some(path => newPath.includes(path));
      const isNavigatingToTables = newPath.includes('/app/tables');

      if (isCurrentPageFeatureOrTables && !isNavigatingToFeaturePage && !isNavigatingToTables) {
        clearModalState();
      }
    });

    return () => unlisten();
  }, [history, clearModalState]);

  return (
    <Switch>
      <PublicRoute path="/login" component={Login} />
      <PublicRoute path="/create-account" component={CreateAccount} />
      <PublicRoute path="/forgot-password" component={ForgotPassword} />
      <PublicRoute path="/registration/:miqaat_id" component={Registration} />
      <PublicRoute path="/miqaat/history" component={RegistrationHistory} />

      <PrivateRoute path="/app" component={Layout} />
      
      <Route exact path="/">
        {isAuthenticated ? <Redirect to="/app/event/miqaat-home" /> : <Redirect to="/login" />}
      </Route>

      <Route path="*">
        {isAuthenticated ? <Redirect to="/app" /> : <Redirect to="/login" />}
      </Route>
    </Switch>
  );
}

export default App;
