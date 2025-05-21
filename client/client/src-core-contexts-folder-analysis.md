# src/core/contexts/ Folder Analysis

This document provides an analysis of the `src/core/contexts/` directory and its contents.

## Folder Overview
- **Path**: `src/core/contexts/`
- **Purpose**: Contains core React Contexts used for managing application-wide state and providing global functionalities.
- **Contents Summary**: Includes contexts and providers for managing authentication state and displaying toast notifications.
- **Relationship**: These contexts are used at a high level in the application's component tree to make authentication status and toast notification functionality available to components throughout the application.
- **Status**: Contains Core React Contexts.

## File: AuthContext.js
- **Purpose**: Defines a React Context and Provider for managing the user's authentication state.
- **Key Functions / Components / Logic**:
    - `AuthContext`: The React Context object.
    - `AuthProvider`: A React component that provides the authentication state (`user`, `loading`) and a function to update the user (`setUser`) to its children.
    - Uses `useEffect` and Firebase's `onAuthStateChanged` to listen for changes in the user's authentication state and update the context accordingly.
    - Provides a basic `useAuth` hook for consuming the context.
- **Dependencies**: `react`, `../config/firebase`, `firebase/auth`.
- **Complexity/Notes**: Standard implementation of an authentication context using React hooks and Firebase Auth state changes.
- **Bugs / Dead Code / Comments**: A comment mentions that logic is in `useAuth.js`, but the `useAuth` hook in this file is just a basic context consumer. The main authentication logic (login, logout, etc.) is likely in a separate hook or service.
- **Improvement Suggestions**: Clarify the comment regarding `useAuth.js` if the main authentication logic resides elsewhere. Ensure proper error handling for Firebase authentication state changes.

## File: ToastContext.js
- **Purpose**: Defines a React Context and Provider for displaying toast notifications.
- **Key Functions / Components / Logic**:
    - `ToastContext`: The React Context object.
    - `ToastProvider`: A React component that manages a list of toasts in its state. Provides a `showToast` function to add new toasts with a specified message, type, and duration. Renders the list of toasts in a fixed position on the screen. Includes a `removeToast` function to dismiss toasts manually.
    - Uses `useCallback` to memoize `showToast` and `removeToast` functions.
- **Dependencies**: `react`, `lucide-react`.
- **Complexity/Notes**: Standard implementation of a toast notification system using React state and context. Uses Tailwind CSS classes for styling.
- **Bugs / Dead Code / Comments**: None apparent.
- **Improvement Suggestions**: Consider adding more customization options for toast appearance and behavior. Ensure accessibility for toast notifications.
