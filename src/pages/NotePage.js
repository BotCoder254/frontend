import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  HStack,
  IconButton,
  Button,
  Tag,
  VStack,
  useColorModeValue,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  SimpleGrid,
  Image,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiMoreVertical, FiFolder } from 'react-icons/fi';
import { notesAPI } from '../services/api';
import NoteEditor from '../components/NoteEditor';

const NotePage = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [note, setNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgBox = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchNote();
  }, [noteId]);

  const fetchNote = async () => {
    try {
      const response = await notesAPI.getNote(noteId);
      setNote(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching note',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await notesAPI.deleteNote(noteId);
        toast({
          title: 'Note deleted',
          status: 'success',
          duration: 2000,
        });
        navigate(-1);
      } catch (error) {
        toast({
          title: 'Error deleting note',
          description: error.message,
          status: 'error',
          duration: 3000,
        });
      }
    }
  };

  const handleSave = async (savedNote) => {
    setNote(savedNote.data);
    onClose();
    toast({
      title: 'Note updated',
      status: 'success',
      duration: 2000,
    });
  };

  const renderBreadcrumbs = () => {
    if (!note) return null;
    const paths = ['/', ...(note.folder ? note.folder.split('/').filter(Boolean) : [])];
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
              >
                {index === 0 ? 'Root' : part}
              </BreadcrumbLink>
            </BreadcrumbItem>
          );
        })}
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{note.title}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
    );
  };

  const renderContent = () => {
    if (!note) return null;

    // Create a temporary div to parse the content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = note.content;

    // Fix image URLs if they are relative
    const images = tempDiv.getElementsByTagName('img');
    Array.from(images).forEach(img => {
      if (img.src.startsWith('/')) {
        img.src = `${process.env.REACT_APP_API_URL}${img.src}`;
      }
    });

    return (
      <Box
        className="note-content"
        dangerouslySetInnerHTML={{ __html: tempDiv.innerHTML }}
        sx={{
          'img': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: 'md',
            margin: '1rem 0',
          },
          'p': {
            mb: 4,
          },
          'h1, h2, h3, h4, h5, h6': {
            mt: 6,
            mb: 4,
            fontWeight: 'bold',
          },
          'ul, ol': {
            pl: 6,
            mb: 4,
          },
          'blockquote': {
            borderLeftWidth: '4px',
            borderLeftColor: 'gray.200',
            pl: 4,
            py: 2,
            my: 4,
            fontStyle: 'italic',
          },
          'pre': {
            bg: 'gray.50',
            p: 4,
            borderRadius: 'md',
            overflowX: 'auto',
            mb: 4,
          },
          'code': {
            fontFamily: 'monospace',
            bg: 'gray.50',
            px: 2,
            py: 1,
            borderRadius: 'sm',
          },
          'table': {
            width: '100%',
            mb: 4,
            borderCollapse: 'collapse',
          },
          'th, td': {
            border: '1px solid',
            borderColor: 'gray.200',
            p: 2,
          },
          'th': {
            bg: 'gray.50',
            fontWeight: 'bold',
          },
        }}
      />
    );
  };

  if (isLoading) {
    return (
      <Container maxW="7xl" py={8}>
        <Text>Loading...</Text>
      </Container>
    );
  }

  if (!note) {
    return (
      <Container maxW="7xl" py={8}>
        <Text>Note not found</Text>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={6} align="stretch">
        {renderBreadcrumbs()}
        
        <Box
          bg={bgBox}
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between" align="flex-start">
              <VStack align="stretch" spacing={2}>
                <Heading size="lg">{note?.title}</Heading>
                <HStack spacing={4}>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(note?.updatedAt).toLocaleDateString()}
                  </Text>
                  {note?.folder !== '/' && (
                    <HStack color="gray.500">
                      <FiFolder size="14" />
                      <Text fontSize="sm">
                        {note?.folder.split('/').pop()}
                      </Text>
                    </HStack>
                  )}
                  <Text fontSize="sm" color="gray.500">
                    {note?.category}
                  </Text>
                </HStack>
                <HStack spacing={2} wrap="wrap">
                  {note?.tags.map((tag) => (
                    <Tag
                      key={tag}
                      size="sm"
                      borderRadius="full"
                      variant="subtle"
                      colorScheme="brand"
                    >
                      {tag}
                    </Tag>
                  ))}
                </HStack>
              </VStack>
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FiMoreVertical />}
                  variant="ghost"
                  size="sm"
                />
                <MenuList>
                  <MenuItem icon={<FiEdit2 />} onClick={onOpen}>
                    Edit
                  </MenuItem>
                  <MenuItem
                    icon={<FiTrash2 />}
                    color="red.500"
                    onClick={handleDelete}
                  >
                    Delete
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>

            {/* Display uploaded images */}
            {note?.images && note.images.length > 0 && (
              <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
                {note.images.map((image, index) => (
                  <Box
                    key={index}
                    position="relative"
                    borderRadius="md"
                    overflow="hidden"
                    border="1px"
                    borderColor={borderColor}
                  >
                    <Image
                      src={image.startsWith('/') ? `${process.env.REACT_APP_API_URL}${image}` : image}
                      alt={`Image ${index + 1}`}
                      objectFit="cover"
                      w="100%"
                      h="200px"
                    />
                  </Box>
                ))}
              </SimpleGrid>
            )}

            {renderContent()}
          </VStack>
        </Box>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Note</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <NoteEditor
              note={note}
              onSave={handleSave}
              onCancel={onClose}
              folder={note.folder}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default NotePage; 