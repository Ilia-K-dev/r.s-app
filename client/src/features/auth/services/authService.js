import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from 'firebase/auth'; //correct

import { auth } from '../../../core/config/firebase'; //correct

export const authApi = {
  login: async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  register: async (email, password, name) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      return result.user;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  resetPassword: async email => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateUserProfile: async (user, data) => {
    try {
      await updateProfile(user, data);
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
