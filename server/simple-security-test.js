// Polyfill fetch
import fetch, { Request, Response, Headers } from 'node-fetch';
global.fetch = fetch;
global.Request = Request;
global.Response = Response;
global.Headers = Headers;

// Import Firebase testing
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

// Main function
async function testBasicRules() {
  try {
    console.log("Setting up test environment...");
    const testEnv = await initializeTestEnvironment({
      projectId: "test-project",
      firestore: { rules: `
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /{document=**} {
              allow read, write: if false;
            }
          }
        }
      ` }
    });

    console.log("Test environment created successfully");

    // Test the most basic rule
    const db = testEnv.unauthenticatedContext().firestore();

    console.log("Testing read access...");
    const result = await assertFails(db.collection("test").doc("doc1").get());

    console.log("Test passed! Basic security rule is working");
    await testEnv.cleanup();
    process.exit(0);
  } catch (error) {
    console.error("Test failed with error:", error);
    process.exit(1);
  }
}

// Run the test
testBasicRules();
