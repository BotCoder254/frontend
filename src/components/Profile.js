import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Avatar,
  Text,
  HStack,
  Divider,
  useColorModeValue,
  Container,
  SimpleGrid,
  InputGroup,
  InputLeftElement,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Switch,
} from '@chakra-ui/react';
import {
  EditIcon,
  CheckIcon,
  CloseIcon,
  AtSignIcon,
  LinkIcon,
  DeleteIcon,
  LockIcon,
} from '@chakra-ui/icons';
import { FiTwitter, FiLinkedin, FiGithub, FiMapPin } from 'react-icons/fi';
import { profileAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    profession: '',
    profilePicture: '',
    socialLinks: {
      twitter: '',
      linkedin: '',
      github: '',
    },
    settings: {
      theme: 'system',
      emailNotifications: true,
      defaultNoteCategory: 'Uncategorized',
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const toast = useToast();
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const {
    isOpen: isPasswordModalOpen,
    onOpen: onPasswordModalOpen,
    onClose: onPasswordModalClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching profile',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await profileAPI.updateProfile(profile);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error updating profile',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await profileAPI.uploadProfilePicture(formData);
      setProfile((prev) => ({
        ...prev,
        profilePicture: response.data.profilePicture,
      }));
      toast({
        title: 'Avatar updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating avatar',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePasswordSubmit = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      await profileAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast({
        title: 'Password updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onPasswordModalClose();
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast({
        title: 'Error updating password',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      await profileAPI.deleteAccount();
      localStorage.removeItem('token');
      navigate('/');
      toast({
        title: 'Account deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error deleting account',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Box
        bg={bgColor}
        p={6}
        borderRadius="lg"
        boxShadow="sm"
        border="1px"
        borderColor={borderColor}
      >
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between">
            <Heading size="lg">Profile</Heading>
            {!isEditing ? (
              <Button
                leftIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                size="sm"
              >
                Edit Profile
              </Button>
            ) : (
              <HStack>
                <Button
                  leftIcon={<CloseIcon />}
                  onClick={() => setIsEditing(false)}
                  size="sm"
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button
                  leftIcon={<CheckIcon />}
                  onClick={handleSubmit}
                  size="sm"
                  isLoading={isLoading}
                >
                  Save
                </Button>
              </HStack>
            )}
          </HStack>

          <Divider />

          <VStack spacing={4} align="center">
            <Avatar
              size="2xl"
              name={profile.name}
              src={profile.profilePicture}
              cursor="pointer"
              onClick={() => document.getElementById('avatar-input').click()}
            />
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
            {isEditing && (
              <Text fontSize="sm" color="gray.500">
                Click the avatar to change your profile picture
              </Text>
            )}
          </VStack>

          <form onSubmit={handleSubmit}>
            <VStack spacing={6}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} width="100%">
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    isReadOnly={!isEditing}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <AtSignIcon color="gray.500" />
                    </InputLeftElement>
                    <Input
                      name="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      isReadOnly={!isEditing}
                      type="email"
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel>Profession</FormLabel>
                  <Input
                    name="profession"
                    value={profile.profession}
                    onChange={handleInputChange}
                    isReadOnly={!isEditing}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FiMapPin />
                    </InputLeftElement>
                    <Input
                      name="location"
                      value={profile.location}
                      onChange={handleInputChange}
                      isReadOnly={!isEditing}
                    />
                  </InputGroup>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Bio</FormLabel>
                <Input
                  name="bio"
                  value={profile.bio}
                  onChange={handleInputChange}
                  isReadOnly={!isEditing}
                  placeholder="Tell us about yourself"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Website</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <LinkIcon color="gray.500" />
                  </InputLeftElement>
                  <Input
                    name="website"
                    value={profile.website}
                    onChange={handleInputChange}
                    isReadOnly={!isEditing}
                    placeholder="https://your-website.com"
                  />
                </InputGroup>
              </FormControl>

              <Divider />

              <Heading size="md">Social Links</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} width="100%">
                <FormControl>
                  <FormLabel>Twitter</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FiTwitter />
                    </InputLeftElement>
                    <Input
                      name="socialLinks.twitter"
                      value={profile.socialLinks.twitter}
                      onChange={handleInputChange}
                      isReadOnly={!isEditing}
                      placeholder="Twitter profile URL"
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel>LinkedIn</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FiLinkedin />
                    </InputLeftElement>
                    <Input
                      name="socialLinks.linkedin"
                      value={profile.socialLinks.linkedin}
                      onChange={handleInputChange}
                      isReadOnly={!isEditing}
                      placeholder="LinkedIn profile URL"
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel>GitHub</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FiGithub />
                    </InputLeftElement>
                    <Input
                      name="socialLinks.github"
                      value={profile.socialLinks.github}
                      onChange={handleInputChange}
                      isReadOnly={!isEditing}
                      placeholder="GitHub profile URL"
                    />
                  </InputGroup>
                </FormControl>
              </SimpleGrid>

              <Divider />

              <Heading size="md">Settings</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} width="100%">
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Email Notifications</FormLabel>
                  <Switch
                    isChecked={profile.settings.emailNotifications}
                    onChange={(e) =>
                      handleInputChange({
                        target: {
                          name: 'settings.emailNotifications',
                          value: e.target.checked,
                        },
                      })
                    }
                    isDisabled={!isEditing}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Default Note Category</FormLabel>
                  <Input
                    name="settings.defaultNoteCategory"
                    value={profile.settings.defaultNoteCategory}
                    onChange={handleInputChange}
                    isReadOnly={!isEditing}
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>
          </form>

          <Divider />

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Button
              leftIcon={<LockIcon />}
              onClick={onPasswordModalOpen}
              variant="outline"
            >
              Change Password
            </Button>
            <Button
              leftIcon={<DeleteIcon />}
              onClick={onDeleteModalOpen}
              colorScheme="red"
              variant="outline"
            >
              Delete Account
            </Button>
          </SimpleGrid>
        </VStack>
      </Box>

      {/* Change Password Modal */}
      <Modal isOpen={isPasswordModalOpen} onClose={onPasswordModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Current Password</FormLabel>
                <Input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>New Password</FormLabel>
                <Input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Confirm New Password</FormLabel>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPasswordModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handlePasswordSubmit}
              isLoading={isLoading}
            >
              Change Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Account Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Account</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to delete your account? This action cannot be
              undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDeleteAccount}
              isLoading={isLoading}
            >
              Delete Account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Profile; 