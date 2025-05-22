# Receipt Scanner Application - Testing

## Project Description

The Receipt Scanner Application is a comprehensive tool designed to streamline the process of managing receipts, tracking inventory based on purchases, and providing financial analytics. It features document scanning with OCR, data organization, inventory management, reporting, user authentication, and data security. It also incorporates a robust feature flag system to enable safe and gradual rollout of new features, particularly during the migration to direct Firebase integration.

## Technologies Used

- **Frontend:** React, Tailwind CSS, Recharts
- **Backend:** Node.js/Express, Firebase services (Authentication, Firestore, Storage, Functions)
- **OCR:** Google Cloud Vision API

## Installation Instructions

1.  **Clone the repository:**
    ```bash
    git clone [repository URL]
    cd app.v3
    ```

2.  **Set up Firebase:**
    - Create a Firebase project in the Firebase Console.
    - Enable Firebase Authentication, Firestore, Storage, and Cloud Functions.
    - Upgrade to the Blaze plan for Cloud Vision API usage (note: this may incur costs).
    - Set up Firebase Admin SDK for the backend and functions.

3.  **Configure Environment Variables:**
    - Create `.env` files based on the provided `.env.template` files in the `client` and `server` directories.
    - Populate the `.env` files with your Firebase project configuration and other necessary environment variables (e.g., Google Cloud Vision API key). **Do NOT commit your `.env` files to Git.**

4.  **Install Dependencies:**
    ```bash
    # Install client dependencies
    cd client
    npm install

    # Install server dependencies
    cd ../server
    npm install

    # Install functions dependencies
    cd ../functions
    npm install
    ```

## Development Setup

1.  **Run the client:**
    ```bash
    cd client
    npm start
    ```

2.  **Run the server:**
    ```bash
    cd server
    npm start
    ```

3.  **Run Firebase Emulators (Recommended for development):**
    - Install the Firebase CLI: `npm install -g firebase-tools`
    - Log in to Firebase: `firebase login`
    - Navigate to the project root (`app.v3`) and initialize emulators: `firebase init emulators` (select Authentication, Firestore, Storage, and Functions)
    - Start the emulators: `firebase emulators:start`

## Frontend Development

### Important: Do Not Attempt Local Builds

Due to environment restrictions, we use GitHub Actions + Firebase Preview Channels for all frontend development.

**DO NOT** attempt to run or build the frontend locally with commands like:
- ❌ `npm start`
- ❌ `npm run build`
- ❌ `npm run dev`
- ❌ `expo start`
- ❌ `expo build:web`

These commands will not work in our restricted environment and will waste time troubleshooting.

### How To Test Frontend Changes

1. Push your changes to a branch
2. Create a pull request
3. GitHub Actions will automatically build and deploy
4. Use the preview URL (posted in PR comments) to test

This approach completely bypasses any local environment restrictions.

## Project Structure

```
.
├── .github/             # GitHub Actions workflows and templates
│   ├── workflows/       # CI workflows
│   └── pull_request_template.md
│   └── CODEOWNERS
├── client/              # Frontend (React)
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
├── server/              # Backend (Node.js/Express)
│   ├── src/
│   ├── package.json
│   └── ...
├── functions/           # Firebase Cloud Functions
│   ├── src/
│   ├── package.json
│   └── ...
├── docs/                # Documentation files
│   ├── architecture.md
│   ├── api.md
│   └── user-documentation.md
├── .gitignore           # Specifies intentionally untracked files
├── firebase.json        # Firebase project configuration
├── firestore.rules      # Firestore security rules
├── storage.rules        # Storage security rules
├── README.md            # Project overview and setup
└── CONTRIBUTING.md      # Contribution guidelines
```

## Security Rule Testing

Comprehensive automated tests are in place to verify the correctness of Firebase Firestore and Storage security rules. These tests ensure data protection and proper access control.

To run the automated security tests, navigate to the `server/` directory and execute the following command:

```bash
cd server
npm run test:security:automated
```

Ensure the Firebase emulators (Authentication, Firestore, Storage) are running before executing the tests.

## Deployment

[Provide instructions on how to deploy the application to Firebase Hosting, Cloud Functions, etc.]

## Contribution Guidelines

Please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file for detailed contribution guidelines.

## License

[Include license information, e.g., MIT License]
