---
title: "Receipt Scanner Application Project Structure"
creation_date: 2025-05-15 04:05:00
update_history:
  - date: 2025-05-15
    description: Updated with detailed project structure and Firebase impact.
status: In Progress
owner: Cline EDI Assistant
related_files:
  - /docs/core/architecture.md
  - /docs/firebase/integration-architecture.md
---

# Receipt Scanner Application Project Structure

[Home](/docs) > [Core Documentation](/docs/core) > Receipt Scanner Application Project Structure

## In This Document
- [Overview](#overview)
- [Architectural Patterns](#architectural-patterns)
- [Key Entry Points](#key-entry-points)
- [Frameworks and Libraries](#frameworks-and-libraries)
- [Component Connections](#component-connections)
- [Directory Structure](#directory-structure)
- [Key Directories and Files](#key-directories-and-files)
- [Firebase Integration Impact on Structure](#firebase-integration-impact-on-structure)
- [Areas Requiring Special Attention](#areas-requiring-special-attention)
- [Future Considerations](#future-considerations)

## Related Documentation
- [Architecture Overview](../core/architecture.md)
- [Firebase Integration Architecture](../firebase/integration-architecture.md)

## Overview

This document details the project structure of the Receipt Scanner application, outlining the organization of directories and files. Understanding the project structure is essential for navigating the codebase and contributing effectively.

## Architectural Patterns

The project utilizes the following key architectural patterns:

-   **Client (React):** Feature-Sliced Design (or a similar modular, feature-based architecture) promoting scalability and maintainability by organizing code by application features. It uses React, likely with Context API or another state management solution for global state.
-   **Server (Node.js/Express):** Service-Oriented Architecture / MVC variant, separating concerns into Routes (defining endpoints), Controllers (handling requests/responses), Services (containing business logic), and Models (representing data structures and interacting with the database - Firestore).
-   **Overall:** Client-Server architecture augmented with Backend-as-a-Service (BaaS) via Firebase and Serverless capabilities via Firebase Cloud Functions.

## Key Entry Points

-   **Client:**
    -   `client/public/index.html`: The HTML shell.
    -   `client/src/index.js`: The main JavaScript entry point where the React app is mounted.
    -   `client/src/App.js`: The root React component, likely setting up routing and global layout.
    -   `client/src/routes.js`: Defines the application's frontend routes.
-   **Server:**
    -   `server/src/app.js`: The main Express application setup file, configuring middleware, routes, and starting the server.
-   **Functions:**
    -   `functions/index.js`: Defines and exports the Firebase Cloud Functions.

## Frameworks and Libraries

-   **Client:** React (UI library), likely React Router (for routing), Tailwind CSS (utility-first CSS framework), Axios or Fetch API (for HTTP requests). TypeScript is configured but usage seems mixed with JavaScript.
-   **Server:** Node.js runtime, Express.js (web framework), Firebase Admin SDK (interaction with Firestore/Storage), Multer (for file uploads), Winston or similar for logging, Jest for testing.
-   **Firebase:** Used extensively for Backend-as-a-Service (BaaS):
    -   Firestore: Primary database.
    -   Firebase Storage: For file/receipt image storage.
    -   Firebase Authentication: Used for user management.
    -   Firebase Hosting: Potentially used to host the client application.
    -   Firebase Cloud Functions: For serverless backend logic.

## Component Connections

```mermaid
graph TD
    A[Client (React)] --> B(Server API (Node/Express));
    B --> C(Firebase Services);
    C --> B;
    C --> A; %% Client interacts directly with Firebase (e.g., Storage, Auth)
    C --> D(Firebase Functions);
    D --> C;
```
The client application interacts with the backend server via RESTful API calls. The server, in turn, interacts with various Firebase services using the Firebase Admin SDK. The client may also interact directly with certain Firebase services like Authentication and Storage using the client-side SDKs, with access controlled by Firebase Security Rules. Firebase Cloud Functions can be triggered by events in Firebase services or act as independent endpoints, interacting with other Firebase services.

## Directory Structure

The project follows a structured approach to organize code and resources. The top-level directories and their purposes are outlined below.

```
.
├── analysis/             # Documentation analysis reports and artifacts
├── build/                # Build output directory (generated)
├── claude chat/          # Archived chat logs with Claude
├── client/               # Frontend application (React/React Native with Expo)
├── cline work and md/    # Cline's work logs and markdown files
├── docs/                 # Project documentation (this directory)
├── emulator-data/        # Firebase emulator data
├── functions/            # Firebase Cloud Functions
├── migration_docs/       # Older migration-related documents
├── receipt-scanner-next/ # Experimental Next.js project
├── rules-test/           # Firebase security rules testing setup
├── scripts/              # Utility scripts
├── server/               # Backend application (Express.js)
├── .firebaserc           # Firebase configuration
├── .gitignore            # Git ignore file
├── babel.config.js       # Babel configuration
├── firebase.json         # Firebase project configuration
├── firestore.indexes.json # Firestore index definitions
├── firestore.rules       # Firestore security rules
├── package-lock.json     # npm dependency lock file
├── package.json          # npm package definitions
├── postcss.config.js     # PostCSS configuration
├── README.md             # Project README
├── storage.rules         # Firebase Storage security rules
└── tailwind.config.js    # Tailwind CSS configuration
```

## Key Directories and Files

- **`/client/`**: Contains the entire frontend application codebase.
    - `/client/src/`: Source files for the frontend.
        - `/client/src/components/`: Reusable UI components.
        - `/client/src/features/`: Code organized by feature (e.g., auth, receipts, inventory).
        - `/client/src/core/`: Core application logic and configuration.
        - `/client/src/utils/`: Utility functions.
    - `/client/public/`: Static assets and HTML entry point.
    - `/client/tests/`: Frontend tests (unit, integration).
- **`/server/`**: Contains the backend application codebase.
    - `/server/src/`: Source files for the backend.
        - `/server/src/controllers/`: Request handlers.
        - `/server/src/services/`: Business logic.
        - `/server/src/routes/`: API route definitions.
        - `/server/src/middleware/`: Express middleware.
    - `/server/tests/`: Backend tests.
- **`/functions/`**: Contains Firebase Cloud Functions.
- **`/docs/`**: Contains all project documentation, organized according to the new structure.
- **`/rules-test/`**: Setup for testing Firebase security rules.
- **`firebase.json`**: Main configuration file for Firebase projects, including hosting, functions, and emulators.
- **`firestore.rules`**: Defines security rules for Firestore database access.
- **`storage.rules`**: Defines security rules for Firebase Storage access.
- **`package.json`**: Lists project dependencies and scripts for both client and server.

## Firebase Integration Impact on Structure

The direct integration with Firebase services significantly influences the project structure, particularly in the `/client/src/features/` directories where frontend code directly interacts with Firebase SDKs. The `/server/` directory's role is reduced, primarily handling operations requiring elevated privileges or external API interactions not suitable for the client. The `/functions/` directory houses server-less functions triggered by Firebase events or HTTP requests. The presence of `firestore.rules`, `storage.rules`, and the `/rules-test/` directory highlights the importance of Firebase security within the project structure.

## Areas Requiring Special Attention

- **`/client/extra/`**: This directory contains historical and miscellaneous files that need to be reviewed and either integrated into the new documentation structure, archived, or removed.
- **`/receipt-scanner-next/`**: The purpose and status of this experimental Next.js project need to be clarified and documented.

## Future Considerations

As the project evolves, the project structure documentation should be updated to reflect changes in architecture, technology choices, and organizational patterns.
