// File: client/src/features/auth/services/authService.js
// Date: 2025-05-10
// Description: Service for handling user authentication using Firebase Auth.
// Reasoning: Refactored to use direct Firebase SDK calls and centralized error handling.
// Potential Optimizations: N/A

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from 'firebase/auth';

import { auth } from '../../../core/config/firebase';
import { handleFirebaseError } from '../../../utils/errorHandler';

export const authApi = {
  login: async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      // Use centralized error handler
      throw handleFirebaseError(error, 'Auth Login');
    }
  },

  register: async (email, password, name) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      return result.user;
    } catch (error) {
      // Use centralized error handler
      throw handleFirebaseError(error, 'Auth Register');
    }
  },

  resetPassword: async email => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      // Use centralized error handler
      throw handleFirebaseError(error, 'Auth Reset Password');
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      // Use centralized error handler
      throw handleFirebaseError(error, 'Auth Logout');
    }
  },

  updateUserProfile: async (user, data) => {
    try {
      await updateProfile(user, data);
    } catch (error) {
      // Use centralized error handler
      throw handleFirebaseError(error, 'Auth Update Profile');
    }
  },
};
