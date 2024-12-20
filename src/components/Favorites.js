import React from 'react';
import { Box, Container, Heading } from '@chakra-ui/react';
import Dashboard from './Dashboard';

const Favorites = () => {
  return (
    <Container maxW="7xl" py={8}>
      <Box mb={8}>
        <Heading size="lg">Favorite Notes</Heading>
      </Box>
      <Dashboard filterFavorites />
    </Container>
  );
};

export default Favorites; 