import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Tag,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Image,
} from '@chakra-ui/react';
import { StarIcon, HamburgerIcon } from '@chakra-ui/icons';
import { FiArchive, FiEdit2, FiTrash2, FiFolder, FiEye } from 'react-icons/fi';

const NoteCard = ({ note, onEdit, onDelete, onToggleFavorite, onToggleArchive, onView }) => {
  const bgCard = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Extract first image from content if exists
  const getFirstImage = (content) => {
    const div = document.createElement('div');
    div.innerHTML = content;
    const img = div.querySelector('img');
    return img ? img.src : null;
  };

  // Get text content without HTML tags
  const getTextContent = (content) => {
    const div = document.createElement('div');
    div.innerHTML = content;
    return div.textContent || div.innerText || '';
  };

  const firstImage = getFirstImage(note.content);
  const textContent = getTextContent(note.content);

  return (
    <Box
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="lg"
      bg={bgCard}
      borderColor={borderColor}
      _hover={{ shadow: 'lg' }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={onView}
      position="relative"
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <Heading size="md" noOfLines={1}>
            {note.title}
          </Heading>
          <HStack>
            <IconButton
              icon={<StarIcon />}
              size="sm"
              variant="ghost"
              color={note.isFavorite ? 'yellow.500' : undefined}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(note);
              }}
              aria-label={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            />
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<HamburgerIcon />}
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                aria-label="More options"
              />
              <MenuList onClick={(e) => e.stopPropagation()}>
                <MenuItem icon={<FiEye />} onClick={onView}>
                  View
                </MenuItem>
                <MenuItem icon={<FiEdit2 />} onClick={() => onEdit(note)}>
                  Edit
                </MenuItem>
                <MenuItem
                  icon={<FiArchive />}
                  onClick={() => onToggleArchive(note)}
                >
                  {note.isArchived ? 'Unarchive' : 'Archive'}
                </MenuItem>
                <MenuItem
                  icon={<FiTrash2 />}
                  color="red.500"
                  onClick={() => onDelete(note._id)}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </HStack>

        {firstImage && (
          <Box
            borderRadius="md"
            overflow="hidden"
            maxH="200px"
          >
            <Image
              src={firstImage}
              alt="Note preview"
              objectFit="cover"
              w="100%"
              h="200px"
            />
          </Box>
        )}

        <Text
          noOfLines={firstImage ? 2 : 3}
          color="gray.600"
          _dark={{ color: 'gray.300' }}
        >
          {textContent}
        </Text>

        <VStack align="stretch" spacing={2}>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.500">
              {note.category}
            </Text>
            {note.folder !== '/' && (
              <HStack>
                <FiFolder size="14" />
                <Text fontSize="sm" color="gray.500">
                  {note.folder.split('/').pop()}
                </Text>
              </HStack>
            )}
          </HStack>
          <HStack spacing={2} wrap="wrap">
            {note.tags.map((tag) => (
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
          <Text fontSize="xs" color="gray.500">
            Last modified: {new Date(note.updatedAt).toLocaleDateString()}
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};

export default NoteCard; 