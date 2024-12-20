import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Text,
  HStack,
  Tag,
  IconButton,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Skeleton,
  TagLabel,
  TagCloseButton,
  useToast,
  Select,
} from '@chakra-ui/react';
import {
  AddIcon,
  SearchIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { notesAPI } from '../services/api';
import NoteEditor from './NoteEditor';
import NoteCard from './NoteCard';

const Dashboard = ({
  filterFavorites,
  filterArchived,
  filterByCategory,
  folderPath,
  hideTitle,
}) => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgCard = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { category } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const pollingInterval = useRef(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await notesAPI.getAllCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        sort: sortBy,
        order: sortOrder,
        folder: folderPath,
      };

      if (selectedTags.length > 0) {
        params.tags = selectedTags.join(',');
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      let response;
      if (filterFavorites) {
        response = await notesAPI.getFavorites(params);
      } else if (filterArchived) {
        response = await notesAPI.getArchived(params);
      } else if (filterByCategory && category) {
        response = await notesAPI.getNotesByCategory(category, params);
      } else if (folderPath) {
        response = await notesAPI.getNotesByFolder(folderPath, params);
      } else {
        response = await notesAPI.getNotes(params);
      }

      setNotes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast({
        title: 'Error fetching notes',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [filterFavorites, filterArchived, category, folderPath, sortBy, sortOrder, selectedTags, searchQuery, selectedCategory]);

  // Initial fetch and setup polling
  useEffect(() => {
    fetchCategories();
    fetchNotes();

    // Set up polling for real-time updates
    pollingInterval.current = setInterval(fetchNotes, 30000); // Poll every 30 seconds

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [fetchNotes]);

  const handleCreateNote = () => {
    setSelectedNote(null);
    onOpen();
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    onOpen();
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await notesAPI.deleteNote(noteId);
        setNotes(notes.filter((note) => note._id !== noteId));
        toast({
          title: 'Note deleted',
          status: 'success',
          duration: 2000,
        });
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

  const handleToggleFavorite = async (note) => {
    try {
      const updatedNote = await notesAPI.updateNote(note._id, {
        ...note,
        isFavorite: !note.isFavorite,
      });
      setNotes(
        notes.map((n) => (n._id === note._id ? updatedNote.data : n))
      );
      toast({
        title: note.isFavorite ? 'Removed from favorites' : 'Added to favorites',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error updating note',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleToggleArchive = async (note) => {
    try {
      const updatedNote = await notesAPI.updateNote(note._id, {
        ...note,
        isArchived: !note.isArchived,
      });
      setNotes(
        notes.map((n) => (n._id === note._id ? updatedNote.data : n))
      );
      toast({
        title: note.isArchived ? 'Note unarchived' : 'Note archived',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error updating note',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSaveNote = async (savedNote) => {
    try {
      if (selectedNote) {
        setNotes(
          notes.map((note) =>
            note._id === savedNote.data._id ? savedNote.data : note
          )
        );
      } else {
        setNotes([savedNote.data, ...notes]);
      }
      onClose();
      toast({
        title: selectedNote ? 'Note updated' : 'Note created',
        status: 'success',
        duration: 2000,
      });
      fetchNotes(); // Refresh the notes list
    } catch (error) {
      toast({
        title: 'Error saving note',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
  };

  const handleTagSelect = (tag) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag];
      return newTags;
    });
  };

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {!hideTitle && (
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
              <Heading size="lg">
                {filterFavorites
                  ? 'Favorite Notes'
                  : filterArchived
                  ? 'Archived Notes'
                  : filterByCategory
                  ? `Category: ${category}`
                  : folderPath
                  ? `Folder: ${folderPath.split('/').pop() || 'Root'}`
                  : 'My Notes'}
              </Heading>
              <HStack spacing={4}>
                <Menu>
                  <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="outline">
                    Sort By
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        setSortBy('updatedAt');
                        setSortOrder('desc');
                      }}
                    >
                      Last Modified
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setSortBy('createdAt');
                        setSortOrder('desc');
                      }}
                    >
                      Created Date
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setSortBy('title');
                        setSortOrder('asc');
                      }}
                    >
                      Title
                    </MenuItem>
                  </MenuList>
                </Menu>
                <Select
                  placeholder="Filter by category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  maxW="200px"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
                <InputGroup maxW="300px">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </InputGroup>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="brand"
                  onClick={handleCreateNote}
                >
                  New Note
                </Button>
              </HStack>
            </Flex>
            {selectedTags.length > 0 && (
              <HStack spacing={2} wrap="wrap">
                <Text fontWeight="medium">Filtered by tags:</Text>
                {selectedTags.map((tag) => (
                  <Tag
                    key={tag}
                    size="md"
                    borderRadius="full"
                    variant="solid"
                    colorScheme="brand"
                    cursor="pointer"
                    onClick={() => handleTagSelect(tag)}
                  >
                    <TagLabel>{tag}</TagLabel>
                    <TagCloseButton />
                  </Tag>
                ))}
              </HStack>
            )}
          </VStack>
        )}

        {isLoading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} height="200px" borderRadius="lg" />
            ))}
          </SimpleGrid>
        ) : notes.length === 0 ? (
          <Box
            textAlign="center"
            py={10}
            px={6}
            borderRadius="lg"
            bg={bgCard}
            borderColor={borderColor}
            borderWidth="1px"
          >
            <Text fontSize="lg" color="gray.600">
              No notes found. Create a new note to get started!
            </Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {notes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                onToggleFavorite={handleToggleFavorite}
                onToggleArchive={handleToggleArchive}
                onView={() => navigate(`/notes/${note._id}`)}
              />
            ))}
          </SimpleGrid>
        )}

        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="2xl"
          scrollBehavior="inside"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {selectedNote ? 'Edit Note' : 'Create New Note'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <NoteEditor
                note={selectedNote}
                onSave={handleSaveNote}
                onCancel={onClose}
                folder={folderPath}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
};

export default Dashboard; 