const admin = require('firebase-admin');
const path = require('path');
const { DEFAULT_CATEGORIES } = require('../../client/src/features/categories/services/categories'); // Adjust path as needed
const { logError, logInfo } = require('../utils/logger'); // Assuming a logger utility exists

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // Assuming your firebase config file exports the initialized admin app
    // and handles environment variable loading and service account setup
    require('../config/firebase');
  } catch (error) {
    logError('Failed to initialize Firebase Admin in seeding script:', error);
    process.exit(1); // Exit if Firebase Admin initialization fails
  }
}

const db = admin.firestore();

/**
 * Seeds default categories for a given user.
 * @param {string} userId The ID of the user to seed categories for.
 */
async function seedDefaultCategories(userId) {
  if (!userId) {
    logError('User ID is required to seed default categories.');
    process.exit(1);
  }

  logInfo(`Attempting to seed default categories for user: ${userId}`);

  const userCategoriesRef = db.collection('users').doc(userId).collection('categories');
  const batch = db.batch();

  try {
    // Check if the user already has categories to avoid duplication
    const existingCategories = await userCategoriesRef.limit(1).get();
    if (!existingCategories.empty) {
      logInfo(`User ${userId} already has categories. Skipping seeding.`);
      return;
    }

    DEFAULT_CATEGORIES.forEach(category => {
      const newCategoryRef = userCategoriesRef.doc(); // Let Firestore auto-generate document ID
      batch.set(newCategoryRef, {
        ...category,
        userId: userId, // Ensure the category is owned by the user
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    logInfo(`Successfully seeded default categories for user: ${userId}`);

  } catch (error) {
    logError(`Error seeding default categories for user ${userId}:`, error);
    throw error; // Re-throw the error for external handling if needed
  }
}

// Example usage (can be called from a CLI or other script)
// To run from CLI: node path/to/seedCategories.js your_user_id
const userIdFromArgs = process.argv[2]; // Get user ID from command line arguments

if (userIdFromArgs) {
  seedDefaultCategories(userIdFromArgs)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else {
  logInfo('Usage: node seedCategories.js <userId>');
  process.exit(0);
}
