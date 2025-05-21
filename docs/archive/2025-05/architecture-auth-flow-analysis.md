---
title: Authentication Flow Analysis
created: [YYYY-MM-DD - Original Creation Date]
last_updated: 2025-05-06
update_history:
  - 2025-05-06: Added standardized metadata header.
status: Complete
owner: [Primary Maintainer]
related_files: []
---

# Authentication Flow Analysis

## Table of Contents

* [Client-Side Authentication](#client-side-authentication)
    * [Authentication Service (`client/src/features/auth/services/authService.js`)](#authentication-service-clientsrcfeaturesauthservicesauthservicejs)
    * [Authentication State Management (`client/src/core/contexts/AuthContext.js`)](#authentication-state-management-clientsrccorecontextsauthcontextjs)
    * [Token Handling](#token-handling)
* [Server-Side Authentication](#server-side-authentication)
    * [Authentication Middleware (`server/src/middleware/auth/auth.js`)](#authentication-middleware-serversrcmiddlewareauthauthjs)
    * [Route Protection](#route-protection)
* [Authentication Flow Summary](#authentication-flow-summary)

This document analyzes the authentication flow within the Receipt Scanner application, covering both client-side and server-side aspects.

## Client-Side Authentication

The client-side application handles user authentication primarily through Firebase Authentication Client SDK, wrapped in a service and managed via a React Context.

*   **Authentication Service (`client/src/features/auth/services/authService.js`):** This service provides functions for core authentication operations by wrapping Firebase Auth methods:
    *   `login(email, password)`: Signs in a user with email and password using `signInWithEmailAndPassword`.
    *   `register(email, password, name)`: Creates a new user with email and password using `createUserWithEmailAndPassword` and updates their profile with a display name using `updateProfile`.
    *   `resetPassword(email)`: Sends a password reset email using `sendPasswordResetEmail`.
    *   `logout()`: Signs out the current user using `signOut`.
    *   `updateUserProfile(user, data)`: Updates the user's profile using `updateProfile`.
    Basic error handling is included in these functions.

### Authentication State Management (`client/src/core/contexts/AuthContext.js`)

A React Context (`AuthContext`) is used to manage and provide the user's authentication state (`user` object and a `loading` flag) to the application.
    *   The `AuthProvider` component uses a `useEffect` hook with `onAuthStateChanged` to listen for changes in the Firebase Authentication state.
    *   When the authentication state changes (user logs in or out), the `user` state in the context is updated, and the `loading` flag is set to `false`.
    *   The `useAuth` hook provides a convenient way for components to access the current user and loading state from the context.

### Token Handling

The client automatically attaches the Firebase Auth ID token to outgoing API requests to the backend. This is handled by an Axios request interceptor in `client/src/shared/services/api.js`. The token is retrieved using `user.getIdToken()` and included in the `Authorization` header as a Bearer token.

## Server-Side Authentication

The backend server uses Firebase Admin SDK to verify the authenticity of requests from the client.

### Authentication Middleware (`server/src/middleware/auth/auth.js`)

The `authenticateUser` middleware is responsible for verifying the Firebase Auth ID token sent by the client with API requests.
    *   It extracts the token from the `Authorization` header.
    *   It uses `admin.auth().verifyIdToken(token, true)` to verify the token's validity and check if it's expired.
    *   If the token is valid, the decoded user information (including `uid` and `email`) is attached to the request object (`req.user`), allowing subsequent route handlers to access the authenticated user's details.
    *   Comprehensive error handling is included for cases like missing tokens, expired tokens, or invalid tokens, returning a 401 Unauthorized status with an appropriate error message.

### Route Protection

The `authenticateUser` middleware is applied to specific routes or groups of routes that require authentication, ensuring that only authenticated users can access those resources. (Specific routes where this middleware is applied would need to be identified by examining route definitions in `server/src/routes/`).

## Authentication Flow Summary

1.  **User Action (Client):** User attempts to log in, register, or performs an action requiring authentication.
2.  **Client Authentication Service:** The client-side `authService` interacts with Firebase Auth Client SDK to perform the requested operation (e.g., `signInWithEmailAndPassword`).
3.  **Firebase Authentication:** Firebase authenticates the user and provides an ID token and user information to the client.
4.  **Client State Update:** The `onAuthStateChanged` listener in `AuthContext.js` detects the authentication state change and updates the `user` state in the context.
5.  **API Request (Client):** When the client makes an API request to the backend that requires authentication, the Axios request interceptor in `client/src/shared/services/api.js` retrieves the current user's ID token and adds it to the `Authorization` header.
6.  **Authentication Middleware (Server):** The `authenticateUser` middleware on the server intercepts the incoming request, extracts the token, and verifies it using Firebase Admin SDK.
7.  **Token Verification (Server):** Firebase Admin SDK verifies the token's signature and expiration.
8.  **Authorization (Server):** If the token is valid, the middleware attaches the user information to the request, and the request proceeds to the intended route handler. If the token is invalid or missing, the middleware sends a 401 Unauthorized response.
9.  **Token Refresh (Client):** If the server returns a 401 error due to an expired token, the Axios response interceptor on the client attempts to refresh the ID token using `user.getIdToken(true)` and retries the original request with the new token.

This flow ensures that users are authenticated on the client side and that backend resources are protected by verifying the authenticity of requests using Firebase Auth tokens.
