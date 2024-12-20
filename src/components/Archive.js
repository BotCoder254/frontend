import React from 'react';
import { Box, Container, Heading } from '@chakra-ui/react';
import Dashboard from './Dashboard';

const Archive = () => {
  return (
    <Container maxW="7xl" py={8}>
      <Box mb={8}>
        <Heading size="lg">Archived Notes</Heading>
      </Box>
      <Dashboard filterArchived />
    </Container>
  );
};

export default Archive; 