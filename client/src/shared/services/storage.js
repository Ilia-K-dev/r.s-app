import { storage } from '../../core/config/firebase';//correct
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';//correct
import { logger } from '../utils/logger';//correct

export const uploadFile = async (file, path) => {
  try {
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const fullPath = path ? `${path}/${fileName}` : fileName;
    
    // Create storage reference
    const storageRef = ref(storage, fullPath);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const url = await getDownloadURL(snapshot.ref);
    
    return {
      url,
      path: fullPath,
      fileName,
      contentType: file.type,
      size: file.size
    };
  } catch (error) {
    logger.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
};

export const uploadImage = async (file, userId) => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please upload an image.');
    }

    const path = `receipts/${userId}`;
    return await uploadFile(file, path);
  } catch (error) {
    logger.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    logger.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
};

export const getFileUrl = async (path) => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    logger.error('Error getting file URL:', error);
    throw new Error('Failed to get file URL');
  }
};

export const generateThumbnail = async (file) => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = await createImageBitmap(file);
    
    // Set thumbnail dimensions
    const maxSize = 200;
    const ratio = Math.min(maxSize / img.width, maxSize / img.height);
    canvas.width = img.width * ratio;
    canvas.height = img.height * ratio;
    
    // Draw scaled image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Convert to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(new File([blob], `thumb_${file.name}`, {
          type: 'image/jpeg',
          lastModified: Date.now()
        }));
      }, 'image/jpeg', 0.7);
    });
  } catch (error) {
    logger.error('Error generating thumbnail:', error);
    throw new Error('Failed to generate thumbnail');
  }
};

// Local storage utilities for caching
export const localCache = {
  set: (key, value, ttl = 3600000) => { // Default TTL: 1 hour
    try {
      const item = {
        value,
        expires: Date.now() + ttl
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      logger.error('Error setting cache:', error);
    }
  },

  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const { value, expires } = JSON.parse(item);
      if (Date.now() > expires) {
        localStorage.removeItem(key);
        return null;
      }
      return value;
    } catch (error) {
      logger.error('Error getting cache:', error);
      return null;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      logger.error('Error removing cache:', error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      logger.error('Error clearing cache:', error);
    }
  }
};

// Session storage utilities for temporary data
export const sessionStorage = {
  set: (key, value) => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      logger.error('Error setting session storage:', error);
    }
  },

  get: (key) => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      logger.error('Error getting session storage:', error);
      return null;
    }
  },

  remove: (key) => {
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      logger.error('Error removing session storage:', error);
    }
  },

  clear: () => {
    try {
      window.sessionStorage.clear();
    } catch (error) {
      logger.error('Error clearing session storage:', error);
    }
  }
};