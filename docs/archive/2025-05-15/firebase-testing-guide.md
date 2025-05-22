# Firebase Security Rules Testing Guide

## Setting Up Test Data Automatically

To easily set up test data for security rules testing:

1. Make sure Firebase emulators are running:
firebase emulators:start

2. In a separate terminal, run the data seeding script:
On Windows
.\seed-data.ps1
Or directly with Node.js
cd server
node seed-all.js

This will automatically:
- Create test users in the Authentication emulator
- Populate the Firestore emulator with test data for documents, receipts, inventory, etc.

## Manual Testing Process

After the data is seeded, you can test security rules by:

1. Opening the Firebase Emulator UI (http://localhost:4000)
2. Selecting different user contexts from the authentication dropdown
3. Attempting operations on the test data
4. Verifying if operations succeed or fail as expected

## Available Test Users

| User ID | Email | Password |
|---------|-------|----------|
| user1 | user1@example.com | password123 |
| user2 | user2@example.com | password123 |

## Test Data Structure

- **Documents**: doc1 (user1), doc2 (user2)
- **Receipts**: receipt1 (user1), receipt2 (user2)
- **Inventory**: item1 (user1), item2 (user2)
- **Stock Movements**: movement1 (related to item1, user1)
This should provide you with a reliable way to populate test data for security rules testing without having to manually recreate it each time in the Emulator UI.
