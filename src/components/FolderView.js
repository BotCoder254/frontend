import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  HStack,
  Button,
  Text,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { FiFolder, FiMoreVertical, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import { foldersAPI } from '../services/api';
import Dashboard from './Dashboard';

const FolderView = () => {
  const { '*': folderPath } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [folderData, setFolderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const bgFolder = useColorModeValue('gray.50', 'gray.700');
  const bgHover = useColorModeValue('gray.100', 'gray.700');
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isRenameOpen, onOpen: onRenameOpen, onClose: onRenameClose } = useDisclosure();
  const { isOpen: isNewFolderOpen, onOpen: onNewFolderOpen, onClose: onNewFolderClose } = useDisclosure();
  const [newName, setNewName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const cancelRef = React.useRef();

  useEffect(() => {
    fetchFolderContents();
  }, [folderPath]);

  const fetchFolderContents = async () => {
    try {
      setIsLoading(true);
      const response = await foldersAPI.getFolderContents(folderPath || '');
      setFolderData(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching folder contents',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFolder = async (folder) => {
    try {
      await foldersAPI.deleteFolder(folder.path);
      toast({
        title: 'Folder deleted',
        status: 'success',
        duration: 2000,
      });
      fetchFolderContents();
      onDeleteClose();
    } catch (error) {
      toast({
        title: 'Error deleting folder',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleRenameFolder = async () => {
    if (!newName.trim()) {
      toast({
        title: 'Folder name is required',
        status: 'error',
        duration: 2000,
      });
      return;
    }

    try {
      await foldersAPI.renameFolder(selectedFolder.path, newName.trim());
      toast({
        title: 'Folder renamed',
        status: 'success',
        duration: 2000,
      });
      fetchFolderContents();
      onRenameClose();
      setNewName('');
    } catch (error) {
      toast({
        title: 'Error renaming folder',
        description: error.message,
        status: 'error',
        duration: 3000,
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
      await foldersAPI.createFolder(folderPath || '', {
        name: newFolderName.trim(),
      });
      toast({
        title: 'Folder created',
        status: 'success',
        duration: 2000,
      });
      fetchFolderContents();
      onNewFolderClose();
      setNewFolderName('');
    } catch (error) {
      toast({
        title: 'Error creating folder',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const renderBreadcrumbs = () => {
    const paths = ['/', ...(folderPath ? folderPath.split('/').filter(Boolean) : [])];
    let fullPath = '';

    return (
      <Breadcrumb>
        {paths.map((part, index) => {
          fullPath = index === 0 ? '' : `${fullPath}/${part}`;
          const isLast = index === paths.length - 1;

          return (
            <BreadcrumbItem key={fullPath || 'root'}>
              <BreadcrumbLink
                onClick={() => navigate(index === 0 ? '/dashboard' : `/folders${fullPath}`)}
                isCurrentPage={isLast}
                fontWeight={isLast ? 'bold' : 'normal'}
              >
                {index === 0 ? 'Root' : part}
              </BreadcrumbLink>
            </BreadcrumbItem>
          );
        })}
      </Breadcrumb>
    );
  };

  const renderSubfolders = () => {
    if (!folderData?.folders.length) return null;

    return (
      <VStack align="stretch" spacing={2}>
        <Text fontWeight="medium" color="gray.500">
          Folders
        </Text>
        <Box
          borderRadius="lg"
          bg={bgFolder}
          p={4}
        >
          <VStack align="stretch" spacing={2}>
            {folderData.folders.map((folder) => (
              <HStack
                key={folder.path}
                justify="space-between"
                p={2}
                borderRadius="md"
                _hover={{ bg: bgHover }}
                transition="all 0.2s"
              >
                <HStack
                  spacing={3}
                  flex={1}
                  cursor="pointer"
                  onClick={() => navigate(`/folders${folder.path}`)}
                >
                  <FiFolder />
                  <Text>{folder.name}</Text>
                </HStack>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FiMoreVertical />}
                    variant="ghost"
                    size="sm"
                  />
                  <MenuList>
                    <MenuItem
                      icon={<FiEdit2 />}
                      onClick={() => {
                        setSelectedFolder(folder);
                        setNewName(folder.name);
                        onRenameOpen();
                      }}
                    >
                      Rename
                    </MenuItem>
                    <MenuItem
                      icon={<FiTrash2 />}
                      color="red.500"
                      onClick={() => {
                        setSelectedFolder(folder);
                        onDeleteOpen();
                      }}
                    >
                      Delete
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            ))}
          </VStack>
        </Box>
      </VStack>
    );
  };

  if (isLoading) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Text>Loading...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        <VStack align="stretch" spacing={4}>
          {renderBreadcrumbs()}
          <HStack justify="space-between">
            <Heading size="lg">
              {folderPath ? folderPath.split('/').pop() : 'Root Folder'}
            </Heading>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="brand"
              onClick={onNewFolderOpen}
            >
              New Folder
            </Button>
          </HStack>
        </VStack>

        {renderSubfolders()}

        <Box pt={4}>
          <Dashboard
            folderPath={folderPath || '/'}
            hideTitle
            key={folderPath || '/'}
          />
        </Box>
      </VStack>

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Folder</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this folder? All notes inside will be moved to the root folder.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => handleDeleteFolder(selectedFolder)}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Modal isOpen={isRenameOpen} onClose={onRenameClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Rename Folder</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="New folder name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRenameClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleRenameFolder}
              isDisabled={!newName.trim()}
            >
              Rename
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isNewFolderOpen} onClose={onNewFolderClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Folder</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onNewFolderClose}>
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
    </Container>
  );
};

export default FolderView; 