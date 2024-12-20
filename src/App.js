import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, Box, extendTheme } from '@chakra-ui/react';
import Layout from './components/Layout';
import Landing from './components/Landing';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Favorites from './components/Favorites';
import Archive from './components/Archive';
import FolderView from './components/FolderView';
import NotePage from './components/NotePage';
import Profile from './components/Profile';

// Define theme with brand colors
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e5f0ff',
      100: '#b8d4ff',
      200: '#8ab8ff',
      300: '#5c9cff',
      400: '#2e80ff',
      500: '#0064ff',
      600: '#004ecc',
      700: '#003999',
      800: '#002466',
      900: '#000f33',
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
      },
    }),
  },
});

// Auth guard component
const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public route component (redirects to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Landing />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <PrivateRoute>
                  <Favorites />
                </PrivateRoute>
              }
            />
            <Route
              path="/archive"
              element={
                <PrivateRoute>
                  <Archive />
                </PrivateRoute>
              }
            />
            <Route
              path="/folders/*"
              element={
                <PrivateRoute>
                  <FolderView />
                </PrivateRoute>
              }
            />
            <Route
              path="/categories/:category"
              element={
                <PrivateRoute>
                  <Dashboard filterByCategory />
                </PrivateRoute>
              }
            />
            <Route
              path="/notes/:noteId"
              element={
                <PrivateRoute>
                  <NotePage />
                </PrivateRoute>
              }
            />

            {/* Catch-all redirect to dashboard or login */}
            <Route
              path="*"
              element={
                <Navigate to={localStorage.getItem('token') ? '/dashboard' : '/'} replace />
              }
            />
          </Routes>
        </Layout>
      </Router>
    </ChakraProvider>
  );
}

export default App;
