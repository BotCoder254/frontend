import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import Navigation from './Navigation';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isLandingPage = location.pathname === '/';
  const isAuthenticated = !!localStorage.getItem('token');
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  // Show only children for auth pages (login/register)
  if (isAuthPage) {
    return <Box>{children}</Box>;
  }

  // Show landing page layout for non-authenticated users
  if (!isAuthenticated && isLandingPage) {
    return (
      <Box>
        <Navigation />
        {children}
      </Box>
    );
  }

  // Show authenticated layout with sidebar
  return (
    <Box bg={bgColor} minH="100vh">
      <Navigation />
      <Sidebar />
      <Box
        ml={{ base: '60px', md: '200px' }}
        pt="4rem"
        transition="margin-left 0.2s"
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 