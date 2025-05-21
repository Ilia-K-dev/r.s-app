// client/src/features/auth/__tests__/authService.test.js

// Import the test helper
const {
  createMock,
  mockUser,
  createFeatureFlagMocks,
  createErrorHandlerMocks
} = require('../../../__mocks__/testHelper');

// Create mock functions for Firebase Auth
const mockSignInWithEmailAndPassword = jest.fn().mockResolvedValue({ user: mockUser });
const mockCreateUserWithEmailAndPassword = jest.fn().mockResolvedValue({ user: mockUser });
const mockSignOut = jest.fn().mockResolvedValue();
const mockSendPasswordResetEmail = jest.fn().mockResolvedValue();
const mockUpdateProfile = jest.fn().mockResolvedValue();

// Mock Firebase modules
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signOut: mockSignOut,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
  updateProfile: mockUpdateProfile
}), { virtual: true });

// Mock the Firebase config
jest.mock('../../../core/config/firebase', () => ({
  auth: { currentUser: mockUser }
}), { virtual: true });

// Mock feature flags and error handler
const featureFlagMocks = createFeatureFlagMocks();
const errorHandlerMocks = createErrorHandlerMocks();

jest.mock('../../../core/config/featureFlags', () => featureFlagMocks, { virtual: true });
jest.mock('../../../utils/errorHandler', () => errorHandlerMocks, { virtual: true });

// IMPORTANT: Import the auth service AFTER setting up all mocks
// This ensures the mocks are in place when the module is loaded
import * as authService from '../services/authService';

describe('Auth Service', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test login functionality
  describe('login', () => {
    it('should call signInWithEmailAndPassword with correct parameters', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';

      // Act
      await authService.login(email, password);

      // Assert
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        email,
        password
      );
    });

    it('should handle errors during login', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const error = new Error('Auth error');
      mockSignInWithEmailAndPassword.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(authService.login(email, password)).rejects.toThrow();
      expect(errorHandlerMocks.handleError).toHaveBeenCalledWith(
        error,
        expect.any(String)
      );
    });
  });

  // Add more tests for other auth service methods...
});
