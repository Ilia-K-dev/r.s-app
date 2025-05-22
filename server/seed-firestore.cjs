// This script populates the Firestore emulator with test data
const admin = require('firebase-admin'); // Use CommonJS modules to address module system conflicts

// Set emulator environment variables
// Use consistent IPv4 addressing (localhost) and actual emulator ports to address addressing and port mismatches
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8081"; // Correct Firestore emulator port
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9100"; // Correct Auth emulator port
process.env.FIREBASE_STORAGE_EMULATOR_HOST = "localhost:9199"; // Correct Storage emulator port

console.log('Starting Firestore data seeding script...');

// Check if already initialized
if (admin.apps.length === 0) {
  // Check if running in emulator and initialize accordingly
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log('Running in Firestore emulator environment.');
    // Simplify admin initialization to rely on environment variables for emulator connection
    admin.initializeApp({
      projectId: 'demo-receipt-scanner' // Use project ID from new prompt
    });
  } else {
    console.log('Running in production or other environment.');
    admin.initializeApp({
      projectId: 'project-reciept-reader-id',
      credential: admin.credential.applicationDefault(),
    });
  }
}

const db = admin.firestore();

// Test data structure matching our application's data model
const seedData = {
  documents: [
    {
      id: 'doc1',
      data: {
        userId: 'user1',
        title: 'User 1 Document',
        content: 'This document belongs to user1',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    },
    {
      id: 'doc2',
      data: {
        userId: 'user2',
        title: 'User 2 Document',
        content: 'This document belongs to user2',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    }
  ],

  receipts: [
    {
      id: 'receipt1',
      data: {
        userId: 'user1',
        merchant: 'Test Store',
        total: 42.99,
        date: admin.firestore.Timestamp.fromDate(new Date()),
        category: 'groceries',
        imageUrl: 'https://example.com/receipt1.jpg'
      }
    },
    {
      id: 'receipt2',
      data: {
        userId: 'user2',
        merchant: 'Another Store',
        total: 27.50,
        date: admin.firestore.Timestamp.fromDate(new Date()),
        category: 'entertainment',
        imageUrl: 'https://example.com/receipt2.jpg'
      }
    }
  ],

  inventory: [
    {
      id: 'item1',
      data: {
        userId: 'user1',
        name: 'Test Item 1',
        quantity: 10,
        category: 'test',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    },
    {
      id: 'item2',
      data: {
        userId: 'user2',
        name: 'Test Item 2',
        quantity: 5,
        category: 'test',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    }
  ],

  stockMovements: [
    {
      id: 'movement1',
      data: {
        inventoryId: 'item1',
        userId: 'user1',
        quantity: 2,
        type: 'add',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      }
    }
  ],

  users: [
    {
      id: 'user1Profile',
      data: {
        name: 'Test User 1',
        email: 'user1@example.com',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    },
    {
      id: 'user2Profile',
      data: {
        name: 'Test User 2',
        email: 'user2@example.com',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    }
  ]
};

async function seedFirestore() {
  const maxRetries = 5;
  const retryDelay = 2000; // 2 seconds

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Attempting Firestore data seeding (Attempt ${i + 1}/${maxRetries})...`);

      // Clear existing data first
      const collections = Object.keys(seedData);
      for (const collection of collections) {
        console.log(`Clearing collection: ${collection}`);
        const snapshot = await db.collection(collection).get();
        const deletePromises = [];
        snapshot.forEach(doc => {
          deletePromises.push(doc.ref.delete());
        });
        await Promise.all(deletePromises);
      }

      // Seed with new data
      for (const collection of collections) {
        console.log(`Seeding collection: ${collection}`);
        const items = seedData[collection];
        for (const item of items) {
          await db.collection(collection).doc(item.id).set(item.data);
          console.log(`  Created ${collection}/${item.id}`);
        }
      }

      console.log('Firestore data seeding completed successfully');
      return; // Exit function if successful
    } catch (error) {
      console.error(`Error seeding Firestore data (Attempt ${i + 1}/${maxRetries}):`, error);
      if (i < maxRetries - 1) {
        console.log(`Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        console.error('Max retries reached for Firestore data seeding.');
        throw error; // Re-throw error if max retries reached
      }
    }
  }
}

// Execute the seeding
seedFirestore();
