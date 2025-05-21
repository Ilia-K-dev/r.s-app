---
title: Firebase Security Rules Documentation
creation_date: 2025-05-15 01:36:36
update_history:
  - date: 2025-05-15
    description: Initial creation of the document.
  - date: 2025-05-15
    description: Added comprehensive documentation for Firestore and Storage security rules.
status: Completed
owner: Cline EDI Assistant
related_files:
  - firestore.rules
  - storage.rules
  - server/tests/security/firestore.test.js
  - server/tests/security/storage.test.js
---

# Firebase Security Rules Documentation

## Overview
With the direct integration of the Firebase SDK into the client application, Firebase Security Rules are the primary mechanism for protecting data in Firestore and files in Cloud Storage. These rules define who has access to what data and how that data can be structured and modified. They are crucial for ensuring data integrity, confidentiality, and availability in a client-driven architecture.

The security rules are defined in `firestore.rules` and `storage.rules` and are enforced on the server-side by Firebase.

## Firestore Security Rules
Firestore security rules are defined in `firestore.rules` and control access to documents within collections. The rules are structured using `match` statements for collections and documents, and `allow` statements for specifying read, write, update, and delete permissions based on conditions.

Key aspects of the Firestore security rules implementation include:

- **Owner-Based Access Control:** The majority of collections (e.g., `receipts`, `inventory`, `documents`, `categories`, `products`, `alerts`, `vendors`, `notifications`, `notificationPreferences`) implement owner-based access control. This is achieved by including a `userId` field in each document and using helper functions (`isOwner`, `isResourceOwner`, `isDataOwner`) to ensure that only the authenticated user who owns the document can read, update, or delete it.
- **Data Validation:** Rules include data validation functions (e.g., `isValidReceipt`, `isValidInventory`, `isValidCategory`) to enforce constraints on the structure, data types, and values of incoming data during create and update operations. This helps maintain data integrity.
- **Cross-Collection Validation:** For collections like `stockMovements`, rules include cross-collection checks using the `get()` function to ensure that a referenced document (e.g., an inventory item) exists and is owned by the user before allowing the creation of a related document.
- **Immutable Data:** The `stockMovements` collection is configured to be immutable after creation (`allow update: if false; allow delete: if false;`) to maintain an accurate audit trail of inventory changes.
- **Server-Created Data:** The `notifications` collection is designed to be primarily created by the server or Cloud Functions (`allow create: if false;`), with clients only allowed to read or update the `isRead` status.

Example of owner-based read rule for receipts:
```firebase
match /receipts/{receiptId} {
  allow read: if request.auth != null && resource.data.userId == request.auth.uid;
  // ... other rules
}
```

Example of data validation and owner check on create for receipts:
```firebase
match /receipts/{receiptId} {
  // ... other rules
  allow create: if request.auth != null && request.resource.data.userId == request.auth.uid && isValidReceipt(request.resource.data);
  // ... other rules
}
```

Example of cross-collection validation for stock movements:
```firebase
match /stockMovements/{stockMovementId} {
  // ... other rules
  allow create: if isDataOwner(request.resource.data)
                && isValidStockMovement(request.resource.data)
                && get(/databases/$(database)/documents/inventory/$(request.resource.data.itemId)).exists()
                && get(/databases/$(database)/documents/inventory/$(request.resource.data.itemId)).data.userId == request.auth.uid;
  // ... other rules
}
```

## Storage Security Rules
Storage security rules are defined in `storage.rules` and control access to files within Cloud Storage buckets based on their paths.

Key aspects of the Storage security rules implementation include:

- **User-Specific Paths:** Files are organized in user-specific paths (e.g., `/profiles/{userId}/...`, `/documents/{userId}/...`, `/inventory/{userId}/...`) to enable owner-based access control.
- **Owner-Based Access Control:** Similar to Firestore, rules use the `isOwner(userId)` helper function to ensure that only the authenticated user can read, create, update, or delete files within their designated paths.
- **Size and Type Restrictions:** Rules include conditions to restrict the size (`request.resource.size`) and content type (`request.resource.contentType`) of uploaded files to prevent abuse and ensure compatibility.
- **Cross-Service Validation:** For inventory item images (`/inventory/{userId}/{productId}/images/{imageId}`), rules include cross-service checks using `firestore.exists()` and `firestore.get()` to verify that the associated inventory document exists in Firestore and is owned by the user before allowing image operations.

Example of owner-based read rule for profile images:
```firebase
match /profiles/{userId}/{fileName} {
  allow read: if isOwner(userId);
  // ... other rules
}
```

Example of create/update rule with size and type restrictions for profile images:
```firebase
match /profiles/{userId}/{fileName} {
  // ... other rules
  allow create, update: if isOwner(userId)
                        && request.resource.size < 2 * 1024 * 1024  // 2MB limit
                        && request.resource.contentType.matches('image/(jpeg|png|gif|webp)');
  // ... other rules
}
```

Example of cross-service validation for inventory images:
```firebase
match /inventory/{userId}/{productId}/images/{imageId} {
   // ... other rules
   allow create, update: if isOwner(userId)
                         && request.resource.size < 5 * 1024 * 1024  // 5MB limit
                         && request.resource.contentType.matches('image/.*')
                         && firestore.exists(/databases/(default)/documents/inventory/$(productId))
                         && firestore.get(/databases/(default)/documents/inventory/$(productId)).data.userId == request.auth.uid;
   // ... other rules
}
```

## Security Testing Approach
Security rules are tested using the Firebase Emulator Suite, specifically the Firestore and Storage emulators. Automated tests are written using the `@firebase/rules-unit-testing` library (see `server/tests/security/firestore.test.js` and `server/tests/security/storage.test.js`). These tests simulate authenticated and unauthenticated users performing various read and write operations to verify that the security rules correctly allow or deny access as intended.

Challenges were encountered during the setup and execution of automated Storage security rules tests due to environment issues (documented in `docs/known-issues.md`). Manual testing using the Firebase Emulator UI was also performed to supplement automated testing.

## Security Best Practices
- **Principle of Least Privilege:** Rules are designed to grant only the necessary permissions to users for specific data.
- **Input Validation:** Data validation rules are used to ensure that data written to Firestore conforms to expected formats and constraints.
- **Owner-Based Access:** Implementing owner-based access control for user-specific data is a fundamental security practice.
- **Regular Review and Testing:** Security rules should be regularly reviewed and tested to ensure they remain effective as the application evolves.

## Potential Vulnerabilities and Mitigations
- **Client-Side Tampering:** While client-side code can be modified, security rules enforced on the server-side prevent unauthorized data access or manipulation.
- **Incomplete Validation:** If data validation rules are not comprehensive, invalid data could be written to the database. Mitigation involves thorough validation rules and potentially using Cloud Functions for complex validation.
- **Misconfigured Rules:** Incorrectly configured rules can lead to unintended data exposure or denial of service. Mitigation requires careful rule writing, thorough testing, and peer review.

## Considerations
- **Performance Impact:** Complex security rules, especially those involving `get()` or `exists()` calls, can impact the performance and cost of Firestore operations. Rules should be optimized for performance where possible.
- **Rule Complexity:** As the application grows, security rules can become complex. Organizing rules with helper functions and clear structure is important for maintainability.
