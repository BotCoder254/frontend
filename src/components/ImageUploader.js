import React, { useState } from 'react';
import {
  Box,
  Button,
  Image,
  SimpleGrid,
  IconButton,
  useToast,
  Text,
  VStack,
  Progress,
  HStack,
} from '@chakra-ui/react';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';

const ImageUploader = ({ onUpload, existingImages = [] }) => {
  const [images, setImages] = useState(existingImages);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const toast = useToast();

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);

    try {
      const uploadedImages = [];
      const totalFiles = files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${process.env.REACT_APP_API_URL}/notes/upload-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');
        
        const data = await response.json();
        uploadedImages.push(data.location);
        
        // Update progress
        setProgress(((i + 1) / totalFiles) * 100);
      }

      setImages([...images, ...uploadedImages]);
      onUpload([...images, ...uploadedImages]);

      toast({
        title: 'Images uploaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error uploading images',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onUpload(newImages);
  };

  return (
    <VStack spacing={4} align="stretch">
      <HStack>
        <Button
          leftIcon={<AddIcon />}
          onClick={() => document.getElementById('image-upload').click()}
          isLoading={uploading}
          loadingText="Uploading..."
          colorScheme="brand"
        >
          Add Images
        </Button>
        <input
          id="image-upload"
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </HStack>

      {uploading && <Progress value={progress} size="sm" colorScheme="brand" />}

      {images.length > 0 ? (
        <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
          {images.map((image, index) => (
            <Box
              key={index}
              position="relative"
              borderRadius="md"
              overflow="hidden"
              border="1px"
              borderColor="gray.200"
            >
              <Image
                src={image}
                alt={`Uploaded ${index + 1}`}
                objectFit="cover"
                w="100%"
                h="150px"
              />
              <IconButton
                icon={<CloseIcon />}
                size="sm"
                position="absolute"
                top={2}
                right={2}
                colorScheme="red"
                onClick={() => handleRemoveImage(index)}
              />
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <Text color="gray.500" textAlign="center">
          No images uploaded yet
        </Text>
      )}
    </VStack>
  );
};

export default ImageUploader; 