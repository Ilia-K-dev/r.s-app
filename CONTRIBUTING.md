# Contributing to the Receipt Scanner Application

Thank you for your interest in contributing to the Receipt Scanner Application! We welcome contributions from everyone. By participating in this project, you agree to abide by our code of conduct.

## How to Contribute

1.  **Fork the repository:** Start by forking the main repository to your GitHub account.
2.  **Clone your forked repository:**
    ```bash
    git clone [your forked repository URL]
    cd app.v3
    ```
3.  **Set up the development environment:** Follow the instructions in the [README.md](README.md) to set up Firebase and install dependencies.
4.  **Create a new branch:** Create a new branch for your feature or bug fix. Use a descriptive name (e.g., `feature/add-inventory-sorting`, `fix/ocr-parsing-error`).
    ```bash
    git checkout -b your-branch-name
    ```
5.  **Make your changes:** Implement your feature or bug fix.
    - Follow the established code style guidelines (see below).
    - Add necessary documentation (code comments, updates to README, API docs, etc.).
    - Add or update tests to cover your changes.
6.  **Test your changes:**
    - Run the application locally to verify functionality.
    - Run all tests to ensure nothing is broken.
    ```bash
    # Example commands (refer to README for specifics)
    cd server && npm test
    cd client && npm test
    ```
7.  **Commit your changes:** Write clear and concise commit messages.
    ```bash
    git add .
    git commit -m "feat: Add inventory sorting"
    ```
8.  **Push your changes to your forked repository:**
    ```bash
    git push origin your-branch-name
    ```
9.  **Create a Pull Request (PR):**
    - Go to the original repository on GitHub.
    - Click the "New pull request" button.
    - Select your branch and the `develop` branch as the base.
    - Fill out the pull request template, including a clear description of your changes, linked issues, and completing the checklists.

## Code Style Guidelines

- We follow standard JavaScript/React/Node.js best practices.
- Use consistent indentation (2 spaces).
- Follow the existing naming conventions.
- Write clear and readable code.
- Use JSDoc comments for functions, classes, and components.

## Pull Request Process

- All pull requests should be opened against the `develop` branch.
- Your PR will be reviewed by a maintainer.
- Address any feedback or requested changes.
- Once approved, your PR will be merged.

## Development Environment Setup

Refer to the "Installation Instructions" and "Development Setup" sections in the [README.md](README.md) for detailed instructions on setting up your development environment.

## Security

- **Never** commit sensitive information such as API keys, passwords, or service account files. Use environment variables and `.gitignore` to prevent this.
- Be mindful of potential security vulnerabilities when writing code.
- The pull request template includes a security checklist to help ensure best practices are followed.

## Licensing

By contributing to the Receipt Scanner Application, you agree that your contributions will be licensed under the project's [LICENSE](LICENSE) file.
