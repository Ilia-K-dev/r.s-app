# Frontend Testing Guide

This guide explains how to test frontend components without requiring deployment to preview channels.

## Local Development Testing

### Prerequisites
- Node.js installed locally
- Firebase CLI installed (`npm install -g firebase-tools`)
- Project dependencies installed (`npm install` in the client directory)

### Starting the Development Environment

Run the following command from the client directory:
```bash
npm run dev
```
This will start:

- The React development server
- Firebase emulators for Hosting, Functions, and Firestore
- Firebase Emulator UI (available at http://localhost:4000)

### Using the Debug Panel
In development mode, a Debug Panel is available in the bottom right corner of the application.

1. Click "Debug Panel" to expand
2. Select a component from the dropdown
3. Click "Run Tests"
4. View test results directly in the panel

### Console-Based Testing
Open your browser console (F12) and use these functions:
```javascript
// Test a component by path (relative to src)
window.testComponent('components/shared/Button');

// If you have a component reference in scope:
window.verifyComponent(componentReference, {prop1: 'value'});
```

### Code-Based Testing
You can add verification directly in your code:
```javascript
// Import the verification utilities
import { verifyComponent, withVerification } from '../utils/development/verifyComponent';

// Verify a component directly
verifyComponent(MyComponent, {prop1: 'value'});

// Create a verified version of a component
const VerifiedComponent = withVerification(MyComponent);

// Use the verified component in your JSX
return (
  <div>
    <VerifiedComponent prop1="value" />
  </div>
);
```

### Benefits Over Preview Deployments
This approach offers several advantages:

- Immediate Feedback: No waiting for deployment processes
- Works Offline: No network or cloud resources required
- Fully Private: Testing happens entirely on your local machine
- Full Control: Easily modify and re-test components
- No Credentials Needed: No service account or GitHub secrets required

### When To Use Preview Deployments Instead
While local testing is powerful, preview deployments are still useful for:

- Testing with team members remotely
- Verifying functionality in production-like environments
- Testing with real Firebase services instead of emulators
- End-to-end testing including authentication flows

The local testing approach is designed to complement, not replace, the preview deployment workflow.
