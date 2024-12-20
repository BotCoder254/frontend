import React from 'react';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  useColorModeValue,
  Stack,
  Image,
  Text,
  Container,
  useColorMode,
  Tooltip,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';

const Navigation = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  // Move all color mode values to the top level of the component
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgHover = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isLandingPage = location.pathname === '/';

  // Don't show navigation on auth pages
  if (isAuthPage) return null;

  // Show different navigation items based on authentication
  const navLinks = isAuthenticated
    ? [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Favorites', path: '/favorites' },
        { name: 'Archive', path: '/archive' },
      ]
    : [
        { name: 'Home', path: '/' },
        { name: 'Features', path: '/#features' },
        { name: 'Pricing', path: '/#pricing' },
      ];

  const NavLink = ({ children, path }) => (
    <RouterLink to={path}>
      <Box
        px={3}
        py={2}
        rounded={'md'}
        _hover={{
          textDecoration: 'none',
          bg: bgHover,
        }}
        color={textColor}
        fontWeight="medium"
      >
        {children}
      </Box>
    </RouterLink>
  );

  return (
    <Box
      bg={bg}
      px={4}
      position="fixed"
      w="100%"
      top={0}
      zIndex={1000}
      borderBottom="1px"
      borderColor={borderColor}
    >
      <Container maxW="7xl">
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
            variant="ghost"
          />
          <HStack spacing={8} alignItems={'center'}>
            <RouterLink to="/">
              <HStack spacing={3}>
                <Image
                  src="/logo.png"
                  alt="Notesque Logo"
                  h="32px"
                  fallbackSrc="https://via.placeholder.com/32"
                />
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  bgGradient="linear(to-r, brand.500, brand.800)"
                  bgClip="text"
                  letterSpacing="tight"
                >
                  Notesque
                </Text>
              </HStack>
            </RouterLink>
            <HStack
              as={'nav'}
              spacing={4}
              display={{ base: 'none', md: 'flex' }}
            >
              {navLinks.map((link) => (
                <NavLink key={link.path} path={link.path}>
                  {link.name}
                </NavLink>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={'center'} gap={4}>
            <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton
                size="md"
                variant="ghost"
                aria-label="Toggle color mode"
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
              />
            </Tooltip>
            {isAuthenticated ? (
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'ghost'}
                  cursor={'pointer'}
                  minW={0}
                  _hover={{ bg: bgHover }}
                >
                  <HStack spacing={3}>
                    <Image
                      borderRadius="full"
                      boxSize="32px"
                      src={user?.profilePicture}
                      alt={user?.name}
                      fallbackSrc="https://bit.ly/broken-link"
                    />
                    <Text display={{ base: 'none', md: 'block' }} fontWeight="medium">
                      {user?.name}
                    </Text>
                  </HStack>
                </MenuButton>
                <MenuList>
                  <MenuItem as={RouterLink} to="/dashboard" fontWeight="medium">
                    Dashboard
                  </MenuItem>
                  <MenuItem onClick={handleLogout} fontWeight="medium">
                    Sign Out
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : !isAuthPage && (
              <HStack spacing={4}>
                <Button
                  as={RouterLink}
                  to="/login"
                  variant={'ghost'}
                  size={'sm'}
                  display={{ base: 'none', md: 'inline-flex' }}
                >
                  Sign In
                </Button>
                <Button
                  as={RouterLink}
                  to="/register"
                  colorScheme={'brand'}
                  size={'sm'}
                  fontWeight="medium"
                >
                  Sign Up
                </Button>
              </HStack>
            )}
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              {navLinks.map((link) => (
                <NavLink key={link.path} path={link.path}>
                  {link.name}
                </NavLink>
              ))}
              {!isAuthenticated && !isAuthPage && (
                <Button
                  as={RouterLink}
                  to="/login"
                  variant={'ghost'}
                  w="full"
                  size={'sm'}
                >
                  Sign In
                </Button>
              )}
            </Stack>
          </Box>
        ) : null}
      </Container>
    </Box>
  );
};

export default Navigation; 