---
title: "Quickstart Guide for New Developers"
creation_date: 2025-05-16
update_history:
  - date: 2025-05-16
    description: Initial creation.
status: In Progress
owner: Cline EDI Assistant
related_files:
  - docs/guides/development-setup.md
  - docs/core/project-structure.md
  - docs/developer/architecture/architecture-project-structure.md
---

# Quickstart Guide for New Developers

[Home](/docs) > [User Documentation](/docs/user) > Quickstart Guide for New Developers

## In This Document
- [Overview](#overview)
- [Setting up Your Development Environment](#setting-up-your-development-environment)
- [Understanding the Project Structure](#understanding-the-project-structure)
- [Running the Application Locally](#running-the-application-locally)
- [Finding More Information](#finding-more-information)

## Related Documentation
- [Development Environment Setup Guide](../guides/development-setup.md)
- [Project Structure Overview](../core/project-structure.md)
- [Project Structure (Post-Cleanup)](../developer/architecture/architecture-project-structure.md)

## Overview

Welcome to the Receipt Scanner application development team! This quickstart guide will help you get your development environment set up and provide a basic understanding of the project structure so you can start contributing quickly.

## Setting up Your Development Environment

Before you can run and work on the Receipt Scanner application, you need to set up your local development environment. This involves installing necessary software and cloning the project repository.

For detailed instructions, please refer to the [Development Environment Setup Guide](../guides/development-setup.md). This guide covers:

- Prerequisites (Node.js, npm, Git, Firebase CLI, Expo CLI)
- Repository Setup (cloning, installing dependencies)
- Environment Configuration (`.env` files)
- Firebase Emulator Setup
- Running the Development Environment

Follow the steps in the setup guide to ensure your environment is correctly configured.

## Understanding the Project Structure

The Receipt Scanner application has a well-defined project structure to organize its different parts. Understanding this structure will help you navigate the codebase and find the files you need.

The project is organized into the following main directories:

- **`/client`**: Contains the React frontend application.
- **`/server`**: Contains the Node.js/Express backend API.
- **`/functions`**: Contains Firebase Cloud Functions.
- **`/docs`**: Contains project documentation (where you are now!).

For a detailed breakdown of the directories and key files within each of these sections, please refer to the [Project Structure Overview](../core/project-structure.md) and the [Project Structure (Post-Cleanup)](../developer/architecture/architecture-project-structure.md) documents. These documents provide insights into the purpose of different directories and files.

## Running the Application Locally

Once your development environment is set up and you understand the project structure, you can run the application locally using the Firebase emulators.

The [Development Environment Setup Guide](../guides/development-setup.md) includes instructions on how to start the Firebase emulators and run the client and server applications locally. Follow these instructions to see the application in action on your machine.

## Finding More Information

This quickstart guide provides a basic introduction. For more in-depth information on specific topics, refer to the following documentation sections:

- **Development Process and Workflow:** [Development Process Workflow Guide](../guides/development-process-workflow.md)
- **Testing:** [Testing Requirements Guide](../guides/testing-requirements.md) and [Firebase Testing Documentation](../firebase/testing.md)
- **API Documentation:** [Backend API Specification](../developer/specifications/specification-api.md)
- **Firebase Integration:** [Firebase Integration Overview](../firebase/overview.md)

Explore the `docs/` directory and the "In This Document" and "Related Documentation" sections within each document to find the information you need.
