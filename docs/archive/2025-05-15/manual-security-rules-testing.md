# Manual Security Rules Testing Process

If the automated seeding scripts are not working, follow this manual process to test Firebase security rules using the Emulator UI.

## Setup

1. Start the Firebase emulators:
```bash
firebase emulators:start
```

2. Open the Emulator UI at http://127.0.0.1:4000

## Testing Authentication Rules

### Test Setup

1. Navigate to the Authentication panel in the Emulator UI
2. Create two test users:
- Email: alice@example.com, Password: password123, UID: alice
- Email: bob@example.com, Password: password123, UID: bob

### Test Cases

1. Authenticate as Alice and verify access to Alice's profile
2. Authenticate as Alice and attempt to access Bob's profile (should fail)
3. Unauthenticated access to any profile (should fail)

## Testing Receipt Rules

### Test Setup

1. Navigate to the Firestore panel in the Emulator UI
2. Create a test receipt for Alice:
- Collection: receipts
- Document ID: receipt1
- Fields:
  - userId: alice
  - title: Grocery shopping
  - amount: 75.50
  - date: '2023-03-15'
  - merchant: 'Supermarket'
  - category: 'Groceries'

### Test Cases

1. Authenticate as Alice and verify read access to receipt1
2. Authenticate as Bob and attempt to read receipt1 (should fail)
3. Authenticate as Alice and create a new receipt with userId=alice
4. Authenticate as Alice and update receipt1
5. Authenticate as Alice and attempt to create a receipt with userId=bob (should fail)

## Testing Document Rules

### Test Setup

1. Navigate to the Firestore panel in the Emulator UI
2. Create a test document for Bob:
- Collection: documents
- Document ID: doc1
- Fields:
  - userId: bob
  - title: Contract
  - type: pdf
  - fileName: contract.pdf

### Test Cases

1. Authenticate as Bob and verify read access to doc1
2. Authenticate as Alice and attempt to read doc1 (should fail)
3. Authenticate as Bob and create a new document with userId=bob
4. Authenticate as Bob and update doc1

## Testing Inventory Rules

### Test Setup

1. Navigate to the Firestore panel in the Emulator UI
2. Create a test inventory item for Alice:
- Collection: inventory
- Document ID: item1
- Fields:
  - userId: alice
  - name: Laptop
  - quantity: 1
  - category: Electronics

### Test Cases

1. Authenticate as Alice and verify read access to item1
2. Authenticate as Bob and attempt to read item1 (should fail)
3. Authenticate as Alice and update item1.quantity to 2
4. Authenticate as Alice and attempt to update item1.quantity to -1 (should fail)

## Recording Results

For each test case, record:
1. The test case
2. Whether it passed or failed
3. Any error messages
4. Screenshots of UI if helpful

Add these results to `docs/manual-security-rules-testing-results.md`.
