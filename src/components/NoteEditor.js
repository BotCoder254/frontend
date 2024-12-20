import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import {
  Box,
  Input,
  Button,
  VStack,
  HStack,
  useToast,
  Tag,
  TagLabel,
  TagCloseButton,
  Input as TagInput,
  IconButton,
  Select,
  Flex,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { AddIcon, ChevronDownIcon, StarIcon } from '@chakra-ui/icons';
import { notesAPI } from '../services/api';
import ImageUploader from './ImageUploader';

const NoteEditor = ({ note, onSave, onCancel, folder = '/' }) => {
  const editorRef = useRef(null);
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags || []);
  const [category, setCategory] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [existingTags, setExistingTags] = useState([]);
  const [existingCategories, setExistingCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [images, setImages] = useState(note?.images || []);
  const toast = useToast();
  const bgHover = useColorModeValue('gray.100', 'gray.700');
  const isDark = useColorModeValue(false, true);
  const [isFavorite, setIsFavorite] = useState(note?.isFavorite || false);

  useEffect(() => {
    fetchExistingTags();
    fetchExistingCategories();
  }, []);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags || []);
      setCategory(note.category || '');
      setImages(note.images || []);
      setIsFavorite(note.isFavorite || false);
    }
  }, [note]);

  const fetchExistingTags = async () => {
    try {
      const response = await notesAPI.getAllTags();
      if (Array.isArray(response.data)) {
        setExistingTags(response.data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchExistingCategories = async () => {
    try {
      const response = await notesAPI.getAllCategories();
      if (Array.isArray(response.data)) {
        const categories = response.data.filter(cat => cat && cat !== 'Uncategorized');
        setExistingCategories(categories);
        if (!category && categories.length > 0) {
          setCategory(categories[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: 'Title is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!category) {
      toast({
        title: 'Category is required',
        description: 'Please select or create a category',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const currentContent = editorRef.current ? editorRef.current.getContent() : content;
    if (!currentContent.trim()) {
      toast({
        title: 'Content is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSaving(true);
    try {
      const noteData = {
        title: title.trim(),
        content: currentContent,
        tags: tags.map(tag => tag.trim()),
        category: category.trim(),
        folder,
        images,
        isFavorite,
      };

      let savedNote;
      if (note?._id) {
        savedNote = await notesAPI.updateNote(note._id, noteData);
      } else {
        savedNote = await notesAPI.createNote(noteData);
      }

      if (isFavorite) {
        await notesAPI.getAllCategories();
      }

      toast({
        title: 'Note saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onSave(savedNote);
    } catch (error) {
      toast({
        title: 'Error saving note',
        description: error.response?.data?.message || 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = (tagToAdd) => {
    const trimmedTag = (tagToAdd || newTag).trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !existingCategories.includes(newCategory.trim())) {
      const newCat = newCategory.trim();
      setCategory(newCat);
      setExistingCategories(prev => [...prev, newCat]);
      setNewCategory('');
    }
  };

  const handleImageUpload = (blobInfo) => {
    return new Promise(async (resolve, reject) => {
      const formData = new FormData();
      formData.append('file', blobInfo.blob(), blobInfo.filename());

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/notes/upload-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        resolve(data.location);
      } catch (error) {
        reject('Image upload failed');
      }
    });
  };

  const handleImagesUpdate = (newImages) => {
    setImages(newImages);
  };

  return (
    <VStack spacing={4} align="stretch" w="100%">
      <Input
        placeholder="Note title"
        size="lg"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fontWeight="bold"
      />

      <Box>
        <Text mb={2} fontWeight="medium">Category <Text as="span" color="red.500">*</Text></Text>
        <Flex gap={2}>
          {existingCategories.length > 0 ? (
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              flex={1}
              isRequired
              placeholder="Select a category"
              isInvalid={!category}
            >
              {existingCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          ) : (
            <Text color="gray.500">No categories available. Create one!</Text>
          )}
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              variant="outline"
            >
              Add New
            </MenuButton>
            <MenuList p={2}>
              <HStack>
                <Input
                  placeholder="New category"
                  size="sm"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                />
                <IconButton
                  icon={<AddIcon />}
                  size="sm"
                  onClick={handleAddCategory}
                  isDisabled={!newCategory.trim()}
                />
              </HStack>
            </MenuList>
          </Menu>
        </Flex>
      </Box>

      <Box>
        <HStack>
          <Text fontWeight="medium">Favorite</Text>
          <IconButton
            icon={<StarIcon />}
            size="sm"
            variant="ghost"
            color={isFavorite ? 'yellow.500' : undefined}
            onClick={() => setIsFavorite(!isFavorite)}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          />
        </HStack>
      </Box>

      <Box>
        <Text mb={2} fontWeight="medium">Tags</Text>
        <VStack align="stretch" spacing={2}>
          <HStack spacing={2} wrap="wrap">
            {tags.map((tag) => (
              <Tag
                key={tag}
                size="md"
                borderRadius="full"
                variant="subtle"
                colorScheme="brand"
              >
                <TagLabel>{tag}</TagLabel>
                <TagCloseButton onClick={() => handleRemoveTag(tag)} />
              </Tag>
            ))}
          </HStack>
          <Flex gap={2}>
            <TagInput
              placeholder="Add tag"
              size="md"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                variant="outline"
              >
                Existing Tags
              </MenuButton>
              <MenuList maxH="200px" overflowY="auto">
                {existingTags
                  .filter((tag) => !tags.includes(tag))
                  .map((tag) => (
                    <MenuItem
                      key={tag}
                      onClick={() => handleAddTag(tag)}
                      _hover={{ bg: bgHover }}
                    >
                      {tag}
                    </MenuItem>
                  ))}
              </MenuList>
            </Menu>
          </Flex>
        </VStack>
      </Box>

      <Box>
        <Text mb={2} fontWeight="medium">Images</Text>
        <ImageUploader onUpload={handleImagesUpdate} existingImages={images} />
      </Box>

      <Divider />

      <Box
        border="1px"
        borderColor="gray.200"
        borderRadius="md"
        _dark={{
          borderColor: 'gray.600',
        }}
      >
        <Editor
          apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
          onInit={(evt, editor) => editorRef.current = editor}
          initialValue={content}
          init={{
            height: 500,
            menubar: true,
            directionality: 'ltr',
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
              'codesample', 'directionality', 'emoticons', 'hr', 'nonbreaking',
              'pagebreak', 'paste', 'print', 'save', 'template'
            ],
            toolbar: 'undo redo | formatselect | ' +
              'bold italic backcolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'image media table | codesample | ltr rtl | removeformat | help',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; direction: ltr; }',
            skin: isDark ? 'oxide-dark' : 'oxide',
            content_css: isDark ? 'dark' : 'default',
            images_upload_handler: handleImageUpload,
            file_picker_types: 'image',
            automatic_uploads: true,
            image_title: true,
            image_caption: true,
            image_advtab: true,
            image_dimensions: true,
            paste_data_images: true,
            relative_urls: false,
            remove_script_host: false,
            convert_urls: true,
            branding: false,
            resize: true,
            statusbar: true,
            elementpath: true,
            autosave_ask_before_unload: true,
            autosave_interval: '30s',
            autosave_prefix: 'tinymce-autosave-{path}{query}-{id}-',
            autosave_restore_when_empty: true,
            autosave_retention: '30m',
          }}
          onEditorChange={(newContent, editor) => {
            setContent(newContent);
          }}
        />
      </Box>

      <HStack spacing={4} justify="flex-end">
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          colorScheme="brand"
          onClick={handleSave}
          isLoading={isSaving}
          loadingText="Saving"
        >
          Save Note
        </Button>
      </HStack>
    </VStack>
  );
};

export default NoteEditor; 