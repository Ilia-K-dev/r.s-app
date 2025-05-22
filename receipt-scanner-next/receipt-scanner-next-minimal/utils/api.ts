console.log('utils/api.ts loaded'); // Added for debugging

import axios from 'axios';
import axiosRetry from 'axios-retry'; // Import axios-retry

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api', // Use environment variable for API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL); // Added for debugging

// Configure axios-retry for the api instance
axiosRetry(api, { retries: 3 }); // Retry failed requests up to 3 times


// Add request or response interceptors here for error handling, authentication tokens, etc.

// Helper function to format API error messages
const formatApiError = (error: any): string => { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('API Error - Response Error:', error.response.data);
    console.error('API Error - Status:', error.response.status);
    console.error('API Error - Headers:', error.response.headers);
    return `Request failed with status ${error.response.status}: ${error.response.data?.message || error.message}`;
  } else if (error.request) {
    // The request was made but no response was received
    console.error('API Error - Request Error:', error.request);
    return 'No response received from server.';
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('API Error - Message:', error.message);
    return `Error setting up request: ${error.message}`;
  }
};

// Last Modified: 5/10/2025, 12:56:16 AM
// Note: Added specific error handling for 401 and 404 status codes in API interceptor.

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const formattedError = formatApiError(error);
    console.error('API Error:', formattedError);

    if (error.response) {
      if (error.response.status === 401) {
        console.error('API Error: Unauthorized - Redirecting to login...');
        // TODO: Implement redirection to login page
        // router.push('/login');
      } else if (error.response.status === 404) {
        console.error('API Error: Resource not found.');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
