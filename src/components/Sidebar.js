import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Icon,
  Text,
  Flex,
  Tooltip,
  useColorModeValue,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useToast,
} from '@chakra-ui/react';
import {
  FiHome,
  FiStar,
  FiArchive,
  FiFolder,
  FiPlus,
  FiChevronRight,
  FiChevronDown,
  FiTag,
} from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import { foldersAPI, notesAPI } from '../services/api';

const SidebarItem = ({ icon, label, path, isActive, onClick, children, isExpanded, onToggle }) => {
  const activeBg = useColorModeValue('brand.50', 'brand.900');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const activeColor = useColorModeValue('brand.600', 'brand.200');

  return (
    <VStack align="stretch" spacing={0}>
      <Tooltip label={label} placement="right" hasArrow>
        <Flex
          align="center"
          p={3}
          mx={3}
          borderRadius="lg"
          role="group"
          cursor="pointer"
          _hover={{
            bg: hoverBg,
          }}
          bg={isActive ? activeBg : 'transparent'}
          color={isActive ? activeColor : undefined}
          onClick={onClick}
        >
          {onToggle && (
            <Icon
              as={isExpanded ? FiChevronDown : FiChevronRight}
              mr={2}
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
            />
          )}
          <Icon as={icon} fontSize="16" />
          <Text ml={4} display={{ base: 'none', md: 'block' }}>
            {label}
          </Text>
        </Flex>
      </Tooltip>
      {isExpanded && children}
    </VStack>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const [folders, setFolders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    folders: true,
    categories: true,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newFolderName, setNewFolderName] = useState('');
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    fetchFolders();
    fetchCategories();
  }, []);

  const fetchFolders = async () => {
    try {
      const response = await foldersAPI.getFolderContents('/');
      setFolders(response.data.folders || []);
    } catch (error) {
      toast({
        title: 'Error fetching folders',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await notesAPI.getAllCategories();
      setCategories(response.data || []);
    } catch (error) {
      toast({
        title: 'Error fetching categories',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: 'Folder name is required',
        status: 'error',
        duration: 2000,
      });
      return;
    }

    try {
      await foldersAPI.createFolder(currentPath, {
        name: newFolderName,
      });
      await fetchFolders();
      onClose();
      setNewFolderName('');
      toast({
        title: 'Folder created',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error creating folder',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const toggleFolder = async (path) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path],
    }));

    if (!expandedFolders[path]) {
      try {
        const response = await foldersAPI.getFolderContents(path);
        setFolders(prev => {
          const newFolders = [...prev];
          response.data.folders.forEach(folder => {
            if (!newFolders.find(f => f.path === folder.path)) {
              newFolders.push(folder);
            }
          });
          return newFolders;
        });
      } catch (error) {
        toast({
          title: 'Error fetching subfolders',
          description: error.message,
          status: 'error',
          duration: 3000,
        });
      }
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderFolders = (parentPath = '/') => {
    if (!Array.isArray(folders)) return null;
    
    const subfolders = folders.filter(f => {
      const folderParentPath = f.path.substring(0, f.path.lastIndexOf('/')) || '/';
      return folderParentPath === parentPath;
    });

    if (!subfolders.length) return null;

    return (
      <VStack align="stretch" pl={parentPath === '/' ? 0 : 4} spacing={0}>
        {subfolders.map((folder) => (
          <SidebarItem
            key={folder.path}
            icon={FiFolder}
            label={folder.name}
            path={`/folders${folder.path}`}
            isActive={location.pathname === `/folders${folder.path}`}
            onClick={() => navigate(`/folders${folder.path}`)}
            isExpanded={expandedFolders[folder.path]}
            onToggle={() => toggleFolder(folder.path)}
          >
            {renderFolders(folder.path)}
          </SidebarItem>
        ))}
      </VStack>
    );
  };

  const mainItems = [
    { icon: FiHome, label: 'All Notes', path: '/dashboard' },
    { icon: FiStar, label: 'Favorites', path: '/favorites' },
    { icon: FiArchive, label: 'Archive', path: '/archive' },
  ];

  return (
    <Box
      position="fixed"
      left={0}
      w={{ base: '60px', md: '200px' }}
      top={16}
      h="calc(100vh - 4rem)"
      borderRight="1px"
      borderColor={borderColor}
      bg={useColorModeValue('white', 'gray.800')}
      transition="width 0.2s"
      overflowY="auto"
    >
      <VStack spacing={2} align="stretch" py={5}>
        {mainItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isActive={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          />
        ))}

        <Box py={2}>
          <Flex
            align="center"
            justify="space-between"
            px={3}
            py={2}
            cursor="pointer"
            onClick={() => toggleSection('folders')}
          >
            <Flex align="center">
              <Icon
                as={expandedSections.folders ? FiChevronDown : FiChevronRight}
                mr={2}
              />
              <Text fontWeight="medium" display={{ base: 'none', md: 'block' }}>
                Folders
              </Text>
            </Flex>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
            >
              <Icon as={FiPlus} />
            </Button>
          </Flex>
          {expandedSections.folders && renderFolders()}
        </Box>

        <Box py={2}>
          <Flex
            align="center"
            px={3}
            py={2}
            cursor="pointer"
            onClick={() => toggleSection('categories')}
          >
            <Icon
              as={expandedSections.categories ? FiChevronDown : FiChevronRight}
              mr={2}
            />
            <Text fontWeight="medium" display={{ base: 'none', md: 'block' }}>
              Categories
            </Text>
          </Flex>
          {expandedSections.categories && (
            <VStack align="stretch" pl={4} spacing={0}>
              {categories.map((category) => (
                <SidebarItem
                  key={category}
                  icon={FiTag}
                  label={category}
                  path={`/categories/${category}`}
                  isActive={location.pathname === `/categories/${category}`}
                  onClick={() => navigate(`/categories/${category}`)}
                />
              ))}
            </VStack>
          )}
        </Box>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Folder</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <Menu>
                <MenuButton as={Button} rightIcon={<FiChevronDown />}>
                  Parent Folder: {currentPath === '/' ? 'Root' : currentPath}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => setCurrentPath('/')}>Root</MenuItem>
                  {folders.map((folder) => (
                    <MenuItem
                      key={folder.path}
                      onClick={() => setCurrentPath(folder.path)}
                    >
                      {folder.path}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleCreateFolder}
              isDisabled={!newFolderName.trim()}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Sidebar; 