import React from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Stack,
  Flex,
  Image,
  Icon,
  useColorModeValue,
  SimpleGrid,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiEdit3, FiShare2, FiLock } from 'react-icons/fi';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const Feature = ({ title, text, icon }) => {
  return (
    <Stack spacing={4} align="center" textAlign="center">
      <Flex
        w={16}
        h={16}
        align="center"
        justify="center"
        color="white"
        rounded="full"
        bg="brand.500"
        mb={1}
      >
        <Icon as={icon} w={8} h={8} />
      </Flex>
      <Text fontWeight={600} fontSize="lg">
        {title}
      </Text>
      <Text color="gray.600">{text}</Text>
    </Stack>
  );
};

const Landing = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Container maxW="container.xl" pt={20} pb={16}>
        <Stack
          align="center"
          spacing={{ base: 8, md: 10 }}
          direction={{ base: 'column', md: 'row' }}
        >
          <MotionBox
            flex={1}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Heading
              lineHeight={1.1}
              fontWeight={600}
              fontSize={{ base: '3xl', sm: '4xl', lg: '6xl' }}
            >
              <Text
                as="span"
                position="relative"
                color="brand.600"
                _after={{
                  content: "''",
                  width: 'full',
                  height: '30%',
                  position: 'absolute',
                  bottom: 1,
                  left: 0,
                  bg: 'brand.100',
                  zIndex: -1,
                }}
              >
                Notesque
              </Text>
              <br />
              <Text as="span" color="gray.900">
                Your Modern Note-Taking Solution
              </Text>
            </Heading>
            <Text color="gray.600" fontSize={{ base: 'md', lg: 'lg' }} mt={5}>
              Capture your thoughts, organize your life, and collaborate with others using
              our powerful and intuitive note-taking platform. Experience the future of
              digital note-taking with Notesque.
            </Text>
            <Stack
              spacing={{ base: 4, sm: 6 }}
              direction={{ base: 'column', sm: 'row' }}
              mt={8}
            >
              <Button
                as={Link}
                to="/register"
                size="lg"
                colorScheme="brand"
                px={8}
                fontSize="md"
                fontWeight={600}
                _hover={{ transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                Get Started
              </Button>
              <Button
                as={Link}
                to="/login"
                size="lg"
                variant="outline"
                colorScheme="brand"
                px={8}
                fontSize="md"
                fontWeight={600}
                _hover={{ transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                Sign In
              </Button>
            </Stack>
          </MotionBox>
          <MotionFlex
            flex={1}
            justify="center"
            align="center"
            position="relative"
            w="full"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Box
              position="relative"
              height="300px"
              rounded="2xl"
              boxShadow="2xl"
              width="full"
              overflow="hidden"
            >
              <Image
                alt="Hero Image"
                fit="cover"
                align="center"
                w="100%"
                h="100%"
                src="https://images.unsplash.com/photo-1542435503-956c469947f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
              />
            </Box>
          </MotionFlex>
        </Stack>
      </Container>

      {/* Features Section */}
      <Box bg={useColorModeValue('gray.50', 'gray.900')} py={20}>
        <Container maxW="container.xl">
          <Stack spacing={4} as={Container} maxW="3xl" textAlign="center" mb={16}>
            <Heading fontSize={{ base: '2xl', sm: '4xl' }} fontWeight="bold">
              Features that Empower You
            </Heading>
            <Text color="gray.600" fontSize={{ base: 'sm', sm: 'lg' }}>
              Everything you need to capture, organize, and share your ideas effectively
            </Text>
          </Stack>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} px={4}>
            <Feature
              icon={FiEdit3}
              title="Intuitive Editor"
              text="Rich text editor with support for markdown, images, and more. Take notes your way."
            />
            <Feature
              icon={FiShare2}
              title="Easy Sharing"
              text="Collaborate with team members and share notes with anyone, anywhere."
            />
            <Feature
              icon={FiLock}
              title="Secure Storage"
              text="Your notes are encrypted and safely stored in the cloud, accessible only to you."
            />
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing; 