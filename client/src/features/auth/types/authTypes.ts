// Authentication Types for Receipt Scanner App

/**
 * Represents the basic user profile information
 */
export interface UserProfile {
    id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    createdAt: string;
    lastLoginAt?: string;
  }
  
  /**
   * Represents the authentication credentials for login
   */
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  /**
   * Represents the registration data for a new user
   */
  export interface RegisterData {
    email: string;
    password: string;
    displayName?: string;
    termsAccepted: boolean;
  }
  
  /**
   * Represents the complete user object after authentication
   */
  export interface User extends UserProfile {
    token: string;
    refreshToken?: string;
  }
  
  /**
   * Represents the authentication state
   */
  export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    error: string | null;
  }
  
  /**
   * Defines the shape of password reset request
   */
  export interface PasswordResetRequest {
    email: string;
  }
  
  /**
   * Represents possible authentication methods
   */
  export type AuthMethod = 'email' | 'google' | 'apple';
  
  /**
   * Interface for authentication service methods
   */
  export interface AuthService {
    login(credentials: LoginCredentials): Promise<User>;
    register(userData: RegisterData): Promise<User>;
    logout(): Promise<void>;
    resetPassword(email: string): Promise<void>;
    getCurrentUser(): User | null;
    refreshToken(): Promise<string>;
    updateProfile(updates: Partial<UserProfile>): Promise<UserProfile>;
  }
  
  /**
   * Defines possible authentication errors
   */
  export enum AuthErrorType {
    INVALID_EMAIL = 'INVALID_EMAIL',
    WRONG_PASSWORD = 'WRONG_PASSWORD',
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    EMAIL_ALREADY_IN_USE = 'EMAIL_ALREADY_IN_USE',
    WEAK_PASSWORD = 'WEAK_PASSWORD',
    TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
  }
  
  /**
   * Custom authentication error class
   */
  export class AuthError extends Error {
    type: AuthErrorType;
    
    constructor(message: string, type: AuthErrorType) {
      super(message);
      this.name = 'AuthError';
      this.type = type;
    }
  }
  
  /**
   * OAuth Provider Configuration
   */
  export interface OAuthProviderConfig {
    provider: AuthMethod;
    clientId?: string;
    scopes?: string[];
  }
  
  /**
   * User Preferences related to Authentication
   */
  export interface AuthPreferences {
    rememberMe: boolean;
    twoFactorEnabled: boolean;
    preferredAuthMethod?: AuthMethod;
  }