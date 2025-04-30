# Error Handling Standards

**Date:** 2025-04-29
**Author:** Cline (AI Engineer)
**Objective:** Define standardized patterns for handling and communicating errors across the client, server, and API layers of the Receipt Scanner application.

## 1. Server-Side Error Handling

### 1.1. Custom Error Class (`AppError`)

*   **Standard:** Use a custom `AppError` class for operational/expected errors (e.g., validation errors, not found, permission denied). This class should extend the built-in `Error` and include an HTTP `statusCode` and a user-friendly `message`.
*   **Location:** `server/src/utils/error/AppError.js` (Verified usage in `documentController.js`).
*   **Example Structure:**
    ```javascript
    // server/src/utils/error/AppError.js 
    class AppError extends Error {
      constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; 
        this.isOperational = true; 
        Error.captureStackTrace(this, this.constructor);
      }
    }
    module.exports = { AppError };
    ```

### 1.2. Service Layer

*   **Standard:** Services should throw `AppError` for known error conditions. For unexpected errors, let the original error propagate or wrap it in a generic `AppError(message, 500)`.
*   **Example (`documentService.js`):**
    ```javascript
    if (!file) {
      throw new AppError('No file provided for upload.', 400); 
    }
    // ... later in catch block ...
    catch (error) {
        logger.error(/*...*/);
        throw new AppError('Server error during document upload.', 500); 
    }
    ```

### 1.3. Controller Layer

*   **Standard:** Wrap asynchronous operations in `try...catch`. Pass caught errors to the next middleware using `next(error)`. Perform initial request validation and throw `AppError` early if needed.
*   **Example (`documentController.js`):**
    ```javascript
    const uploadDocument = async (req, res, next) => {
      try {
        if (!req.file) throw new AppError('No document file provided.', 400);
        const userId = req.user?.uid;
        if (!userId) throw new AppError('User not authenticated.', 401);
        
        // ... service calls ...
        
        res.status(201).json(/* success response */);
      } catch (error) {
        logger.error(`Error processing document upload for user ${req.user?.uid}: ${error.message}`, { stack: error.stack, name: error.name }); 
        // Pass potentially wrapped error to centralized handler
        next(error instanceof AppError ? error : new AppError('Failed to process document.', 500)); 
      }
    };
    ```

### 1.4. Centralized Error Handler (Middleware in `app.js`)

*   **Standard:** Implement final error handling middleware in `app.js`. Log the full error. Send standardized JSON responses based on whether the error is operational (`AppError`) or an unknown/programming error. Handle specific error types like `MulterError`.
*   **Current Implementation (`app.js`):** The existing middleware in `app.js` already follows this pattern well, logging errors and sending structured JSON responses with appropriate status codes.

## 2. API Error Communication

*   **Standard:** The server consistently returns JSON: `{ status: 'fail'|'error', message: 'User-friendly message' }`.
*   **Example:**
    ```json
    { "status": "fail", "message": "No document file provided." } 
    { "status": "error", "message": "Server error during document upload." } 
    ```

## 3. Client-Side Error Handling

### 3.1. API Service Layer (e.g., `inventoryService.js`)

*   **Standard:** Wrap `api` calls in `try...catch`. Extract the user-friendly message from `error.response?.data?.message`. Log the original error. Rethrow a new `Error` with the user-friendly message.
*   **Example (`inventoryService.js` - Refactored):**
    ```javascript
    async getInventory(userId, filters = {}) {
      try {
        const response = await api.get(API_BASE_PATH, { params: { userId, ...filters } });
        return response.data; 
      } catch (error) {
        logger.error('Error fetching inventory via API:', error); 
        const message = error.response?.data?.message || 'Failed to fetch inventory';
        throw new Error(message); 
      }
    }
    ```

### 3.2. Hook Layer (e.g., `useInventory.js`)

*   **Standard:** Wrap service calls in `try...catch`. Update the hook's `error` state with `err.message`. Use `showToast` for user notification. Reset `loading` state in `finally`.
*   **Example (`useInventory.js` - Verified):**
    ```javascript
     const fetchInventory = async () => {
       try {
         setLoading(true);
         setError(null); 
         if (!user) throw new Error('User not authenticated');
         
         const data = await inventoryService.getInventory(user.uid);
         setInventory(data);
       } catch (err) {
         setError(err.message); 
         showToast(err.message, 'error'); 
         console.error('Error in fetchInventory hook:', err); 
       } finally {
         setLoading(false);
       }
     };
    ```

### 3.3. Component Layer

*   **Standard:** Use `loading` state for loading indicators and disabling inputs/buttons. Use `error` state to conditionally display user-friendly messages via an `<Alert>` component.
*   **Example (Conceptual):**
    ```jsx
    function SomeComponent() {
      const { data, loading, error, performAction } = useSomeHook();

      if (loading) return <Loading />;

      return (
        <div>
          {error && <Alert type="error" message={error} className="mb-4" />}
          {/* ... render data ... */}
          <Button onClick={performAction} disabled={loading}>Do Action</Button>
        </div>
      );
    }
    ```

## Guidelines for Future Development

*   Adhere to these patterns consistently.
*   Use `AppError` on the server for operational errors.
*   Ensure clear, user-friendly messages are sent from the API.
*   Log detailed errors on the server using the `logger`.
*   Use `useToast` for client-side notifications and display persistent errors using `<Alert>`.
