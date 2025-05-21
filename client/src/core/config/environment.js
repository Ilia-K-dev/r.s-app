// Modified as part of build error fix task on 2025-05-08, 4:00:11 AM
// Temporarily bypassing environment variable loading to isolate stream module resolution issues.

// Environment variable loader for client
const loadEnvironment = () => {
  // Temporarily commented out to bypass environment loading for troubleshooting stream issues
  // if (process.env.NODE_ENV === 'development') {
  //   require('dotenv').config({ path: '.env.development' });
  // } else if (process.env.NODE_ENV === 'production') {
  //   require('dotenv').config({ path: '.env.production' });
  // }
};

// Temporarily commented out the function call to bypass environment loading
// loadEnvironment();
