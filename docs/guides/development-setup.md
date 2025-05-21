---
title: "Development Environment Setup"
creation_date: 2025-05-15 04:25:00
update_history:
  - date: 2025-05-15
    description: Initial creation
status: In Progress
owner: Cline EDI Assistant
related_files:
  - /docs/guides/development-process-workflow.md
  - /docs/guides/testing-environment.md
  - /docs/developer/guides/guide-deployment.md
  - /docs/firebase/overview.md
---

# Development Environment Setup

[Home](/docs) > [Guides](/docs/guides) > Development Environment Setup

## In This Document
- [Prerequisites](#prerequisites)
- [Repository Setup](#repository-setup)
- [Environment Configuration](#environment-configuration)
- [Firebase Emulator Setup](#firebase-emulator-setup)
- [Running the Development Environment](#running-the-development-environment)
- [Common Setup Issues](#common-setup-issues)

## Related Documentation
- [Development Process Workflow](./development-process-workflow.md)
- [Test Environment Configuration](./testing-environment.md)
- [Deployment Guide](../developer/guides/guide-deployment.md)
- [Firebase Integration Overview](../firebase/overview.md)

This guide provides comprehensive instructions for setting up the Receipt Scanner development environment.

## Prerequisites

- Node.js 16.x or later
- npm 7.x or later
- Git
- Firebase CLI (`npm install -g firebase-tools`)
- Expo CLI (`npm install -g expo-cli`)

## Repository Setup

```bash
# Clone the repository
git clone https://github.com/your-org/receipt-scanner.git
cd receipt-scanner

# Install dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..

# Install server dependencies
cd server
npm install
cd ..
```

## Environment Configuration

Create the following environment files:

`.env.development` in the project root:
```dotenv
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```
[Additional environment setup instructions]

## Firebase Emulator Setup
[Detailed emulator setup instructions]

## Running the Development Environment
[Running instructions]

## Common Setup Issues
[Troubleshooting guidance]
