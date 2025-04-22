import { useContext, useState, useEffect } from 'react';//correct
import { AuthContext } from '../../../core/contexts/AuthContext';//correct
import { auth } from '../../../core/config/firebase';//correct
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';//correct
import { useToast } from '../../../shared/hooks/useToast';//correct'

export const useAuth = () => {
  const context = useContext(AuthContext);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, setUser } = context;

  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      showToast('Successfully logged in', 'success');
      return result.user;
    } catch (error) {
      let errorMessage = 'Failed to login';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Invalid password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        default:
          errorMessage = error.message;
      }
      showToast(errorMessage, 'error');
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      setUser(result.user);
      showToast('Account created successfully', 'success');
      return result.user;
    } catch (error) {
      let errorMessage = 'Failed to create account';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        default:
          errorMessage = error.message;
      }
      showToast(errorMessage, 'error');
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      showToast('Successfully logged out', 'success');
    } catch (error) {
      showToast('Failed to logout', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      showToast('Password reset email sent', 'success');
    } catch (error) {
      let errorMessage = 'Failed to send reset email';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          break;
        default:
          errorMessage = error.message;
      }
      showToast(errorMessage, 'error');
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (data) => {
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, data);
      setUser({ ...auth.currentUser });
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update profile', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile
  };
};

export default useAuth;
