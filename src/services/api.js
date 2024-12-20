import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    if (response.data.success === false) {
      return Promise.reject({
        message: response.data.message || 'Operation failed',
        errors: response.data.errors
      });
    }
    // Return data directly if it's a success response
    return response.data.data || response.data;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: 'Network error - please check your internet connection'
      });
    }

    // Handle token expiration
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject({
        message: 'Session expired - please login again'
      });
    }

    // Return error message from response if available
    const message = error.response.data.message || 'Something went wrong';
    const errors = error.response.data.errors || [];
    return Promise.reject({ message, errors });
  }
);

// Helper function to handle image URLs
const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${process.env.REACT_APP_API_URL}${imageUrl}`;
};

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  },
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  }
};

// Notes API
export const notesAPI = {
  // Basic CRUD operations
  getNotes: async (params = {}) => {
    try {
      const response = await api.get('/notes', { 
        params: {
          ...params,
          sort: params.sort || 'updatedAt',
          order: params.order || 'desc'
        }
      });
      return response;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  },
  getNote: async (id) => {
    try {
      const response = await api.get(`/notes/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching note:', error);
      throw error;
    }
  },
  createNote: async (note) => {
    try {
      const response = await api.post('/notes', {
        ...note,
        category: note.category || 'Uncategorized',
        tags: note.tags || [],
        folder: note.folder || null,
        images: note.images || []
      });
      return response;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },
  updateNote: async (id, note) => {
    try {
      const response = await api.put(`/notes/${id}`, note);
      return response;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },
  deleteNote: async (id) => {
    try {
      const response = await api.delete(`/notes/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },
  
  // Special views
  getFavorites: async (params = {}) => {
    try {
      const response = await api.get('/notes/favorites', { params });
      return response;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  },
  getArchived: async (params = {}) => {
    try {
      const response = await api.get('/notes/archived', { params });
      return response;
    } catch (error) {
      console.error('Error fetching archived notes:', error);
      throw error;
    }
  },
  getNotesByCategory: async (category, params = {}) => {
    try {
      const response = await api.get(`/notes/category/${encodeURIComponent(category)}`, { params });
      return response;
    } catch (error) {
      console.error('Error fetching notes by category:', error);
      throw error;
    }
  },
  getNotesByFolder: async (folderId, params = {}) => {
    try {
      const response = await api.get(`/notes/folder/${folderId}`, { params });
      return response;
    } catch (error) {
      console.error('Error fetching notes by folder:', error);
      throw error;
    }
  },
  
  // Metadata operations
  getAllTags: () => api.get('/notes/tags'),
  getAllCategories: () => api.get('/notes/categories'),
  
  // Note actions
  toggleFavorite: (id) => api.patch(`/notes/${id}/favorite`),
  toggleArchive: (id) => api.patch(`/notes/${id}/archive`),
  moveToFolder: (id, folderId) => api.patch(`/notes/${id}/move`, { folderId }),
  updateCategory: (id, category) => api.patch(`/notes/${id}/category`, { category }),
  
  // Image upload
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/notes/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data) {
        return {
          location: getFullImageUrl(response.data.location),
          url: getFullImageUrl(response.data.url),
          filename: response.data.filename
        };
      }
      return response;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },
};

// Folders API
export const foldersAPI = {
  // Basic CRUD operations
  getFolders: async () => {
    try {
      const response = await api.get('/folders');
      return response;
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw error;
    }
  },
  getFolder: async (id) => {
    try {
      const response = await api.get(`/folders/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching folder:', error);
      throw error;
    }
  },
  createFolder: async (folderData) => {
    try {
      const response = await api.post('/folders', {
        ...folderData,
        parentId: folderData.parentId || null
      });
      return response;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  },
  updateFolder: async (id, folderData) => {
    try {
      const response = await api.put(`/folders/${id}`, {
        ...folderData,
        parentId: folderData.parentId || null
      });
      return response;
    } catch (error) {
      console.error('Error updating folder:', error);
      throw error;
    }
  },
  deleteFolder: async (id) => {
    try {
      const response = await api.delete(`/folders/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  },
  
  // Folder contents
  getFolderContents: async (id) => {
    try {
      const response = await api.get(`/folders/${id}/contents`);
      return response;
    } catch (error) {
      console.error('Error fetching folder contents:', error);
      throw error;
    }
  },
  getFolderNotes: async (id) => {
    try {
      const response = await api.get(`/folders/${id}/notes`);
      return response;
    } catch (error) {
      console.error('Error fetching folder notes:', error);
      throw error;
    }
  },
  getFolderDetails: async (id) => {
    try {
      const response = await api.get(`/folders/${id}/details`);
      return response;
    } catch (error) {
      console.error('Error fetching folder details:', error);
      throw error;
    }
  },
  getFolderHierarchy: async (id) => {
    try {
      const response = await api.get(`/folders/${id}/hierarchy`);
      return response;
    } catch (error) {
      console.error('Error fetching folder hierarchy:', error);
      throw error;
    }
  },
  
  // Folder actions
  moveFolder: async (id, parentId) => {
    try {
      const response = await api.patch(`/folders/${id}/move`, { parentId: parentId || null });
      return response;
    } catch (error) {
      console.error('Error moving folder:', error);
      throw error;
    }
  },
};

// Profile API
export const profileAPI = {
  getProfile: async () => {
    const response = await api.get('/profile/me');
    if (response) {
      return {
        ...response,
        profilePicture: getFullImageUrl(response.profilePicture),
      };
    }
    return response;
  },
  updateProfile: (data) => api.patch('/profile/me', data),
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    const response = await api.post('/profile/me/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      ...response,
      profilePicture: getFullImageUrl(response.profilePicture),
    };
  },
  changePassword: (data) => api.post('/profile/me/change-password', data),
  deleteAccount: () => api.delete('/profile/me'),
  updateLastActive: () => api.post('/profile/me/active'),
};

export default api; 