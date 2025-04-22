export interface User {
    id: string;
    email: string;
    name: string;
    profileImage: string;
    role: 'user' | 'admin';
  }
  
  export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegistrationData {
    email: string;
    password: string;
    name: string;
    profileImage?: string;
  }