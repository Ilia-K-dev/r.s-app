---
title: Environment Configuration Analysis
created: [YYYY-MM-DD - Original Creation Date]
last_updated: 2025-05-06
update_history:
  - 2025-05-06: Added standardized metadata header.
status: Complete
owner: [Primary Maintainer]
related_files: []
---

# Environment Configuration Analysis

## Table of Contents

* [Configuration Storage](#configuration-storage)
* [Configuration Variables](#configuration-variables)
    * [Server (`server/.env.template`, `server/.env.production`)](#server-serverenvtemplate-serverenvproduction)
    * [Client (`client/.env.development`, `client/.env.production`)](#client-clientenvdevelopment-clientenvproduction)
* [Configuration Loading and Access](#configuration-loading-and-access)
* [Observations and Potential Issues](#observations-and-potential-issues)
    * [Inconsistent Firebase Admin Configuration](#inconsistent-firebase-admin-configuration)
    * [Missing `process.env` Usage in Client Code](#missing-processenv-usage-in-client-code)
    * [Missing `REACT_APP_API_URL` in Client `.env` files](#missing-react_app_api_url-in-client-env-files)
    * [Sensitive Information](#sensitive-information)

This document analyzes how the Receipt Scanner application is configured for different environments, where configuration values are stored, and how they are accessed.

## Configuration Storage

Environment-specific configuration values are primarily stored in `.env` files:

### Server

*   `server/.env.template`: A template file outlining required server-side environment variables.
    *   `server/.env.production`: Defines variables for the production environment.
    *   A `.env` file (not read) is likely used for the development environment on the server, based on the use of `dotenv`.

### Client

*   `client/.env.development`: Defines variables for the development environment.
    *   `client/.env.production`: Defines variables for the production environment.

## Configuration Variables

The `.env` files define various configuration variables:

### Server (`server/.env.template`, `server/.env.production`)

*   `PORT`: Server listening port.
    *   `NODE_ENV`: Environment mode (e.g., `production`).
    *   `FRONTEND_URL`: Frontend URL for CORS configuration.
    *   `LOG_LEVEL`: Logging level for Winston.
    *   **Firebase Admin SDK:**
        *   `server/.env.template` suggests using `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service account key file and `FIREBASE_PROJECT_ID`.
        *   `server/.env.production` uses individual variables (`FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_STORAGE_BUCKET`) and `GOOGLE_APPLICATION_CREDENTIALS` pointing to `./config/service-account.json`. This indicates different configuration methods are used or intended.
    *   `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`: Credentials for SendGrid.
    *   `GOOGLE_APPLICATION_CREDENTIALS`: Path to Google Cloud Vision service account key file (used in `server/.env.production`).
    *   Image Processing Limits: `MAX_FILE_SIZE`, `ALLOWED_MIME_TYPES`, `MIN_IMAGE_WIDTH`, `MIN_IMAGE_HEIGHT`, `MAX_IMAGE_WIDTH`, `MAX_IMAGE_HEIGHT` (defined in `server/.env.production`).
    *   Optional: `VISION_API_ENDPOINT`, `JWT_SECRET` (mentioned in `server/.env.template`).

### Client (`client/.env.development`, `client/.env.production`)

*   `REACT_APP_FIREBASE_API_KEY`, `REACT_APP_FIREBASE_AUTH_DOMAIN`, `REACT_APP_FIREBASE_PROJECT_ID`, `REACT_APP_FIREBASE_STORAGE_BUCKET`, `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`, `REACT_APP_FIREBASE_APP_ID`: Firebase Client SDK configuration.
    *   `REACT_APP_FIREBASE_MEASUREMENT_ID`: Firebase Measurement ID (only in `client/.env.production`).
    *   `REACT_APP_FRONTEND_URL`: Frontend URL.
    *   `REACT_APP_API_URL`: Backend API base URL (referenced in client code, but not explicitly defined in the client `.env` files read, suggesting it might be in a different client `.env` file or handled differently).

## Configuration Loading and Access

### Server

The `dotenv` library is used in `server/src/app.js` to load environment variables from a `.env` file into `process.env`. The `server/src/scripts/checkEnv.js` script likely verifies that required environment variables are set.
*   **Client:** Environment variables are expected to be accessed via `process.env.REACT_APP_...`. However, a search for `process.env` in the client source code did not return results, which is unexpected and requires further investigation to understand how these variables are actually accessed and used in the client application.

## Observations and Potential Issues

### Inconsistent Firebase Admin Configuration

The template and production server `.env` files suggest different methods for configuring Firebase Admin SDK (`GOOGLE_APPLICATION_CREDENTIALS` vs. individual variables). This inconsistency should be clarified and standardized.
### Missing `process.env` Usage in Client Code

The lack of `process.env` usage found in the client source code search is a significant discrepancy that needs to be understood. It's possible a build process or another configuration loading mechanism is in place.
### Missing `REACT_APP_API_URL` in Client `.env` files

The `REACT_APP_API_URL` is referenced in the client code for the API base URL, but was not found in the client `.env.development` or `.env.production` files read. Its source should be identified.
### Sensitive Information

API keys and credentials (Firebase, SendGrid, Google Cloud Vision) are stored directly in `.env` files. While common for development, secure practices for managing secrets in production (e.g., using environment variables provided by the hosting platform, secret management services) should be ensured.

This analysis highlights the key aspects of the application's environment configuration and points out areas that require further investigation or potential improvement for consistency, clarity, and security.
