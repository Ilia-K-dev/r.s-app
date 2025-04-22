const axios = require('axios');
const fs = require('fs').promises;
const FormData = require('form-data');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} = require('firebase/auth');

// Detailed Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAWx_ZcWGx8XoCl-fWXoO8TPJi7hzDrWjQ",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "project-reciept-reader-id.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "project-reciept-reader-id",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "project-reciept-reader-id.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "116226858234792585947",
  appId: process.env.FIREBASE_APP_ID || "1:116226858234792585947:web:abc123def456"
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m'
};

// Helper function for logging
const log = {
    success: (msg) => console.log(`${colors.bright}${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.bright}${colors.red}❌ ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.bright}${colors.yellow}ℹ️  ${msg}${colors.reset}`),
    section: (msg) => console.log(`\n${colors.bright}${colors.yellow}${msg}${colors.reset}`)
};

const testBackend = async () => {
    // Initialize Firebase app
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    try {
        // 1. Test Server Health
        log.section('Testing Server Health...');
        try {
            log.info(`Attempting to connect to http://localhost:5000/health`);
            const healthResponse = await axios.get(`http://localhost:5000/health`);
            log.success('Server is healthy');
            log.info(`Response status: ${healthResponse.status}`);
            log.info(`Server Environment: ${healthResponse.data.environment}`);
            log.info(`Server Uptime: ${Math.floor(healthResponse.data.uptime)} seconds`);
        } catch (error) {
            log.error('Server health check failed');
            if (error.code === 'ECONNREFUSED') {
                log.error('Could not connect to server. Is it running on port 5000?');
            }
            throw error;
        }

        // 2. Test Auth Endpoints
        log.section('Testing Authentication...');
        const authData = {
            email: `test${Date.now()}@example.com`,
            password: 'Test123!'
        };
        
        try {
            // Create user with Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, authData.email, authData.password);
            const user = userCredential.user;
            
            // Get the current ID token
            const idToken = await user.getIdToken();
            log.success('Registration successful');
            log.info(`User created with email: ${authData.email}`);
            log.info(`Generated ID Token: ${idToken}`);

            // Verify token length and structure
            if (idToken.split('.').length !== 3) {
                throw new Error('Invalid token format. Expected a JWT.');
            }

            // 3. Test Categories with ID Token
            log.section('Testing Categories...');
            const categoryData = {
                name: 'Test Category',
                color: '#FF5733',
                budget: 1000
            };

            try {
                const categoryResponse = await axios.post(
                    `http://localhost:5000/api/categories`,
                    categoryData,
                    {
                        headers: { 
                            'Authorization': `Bearer ${idToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                log.success('Category created successfully');
                const categoryId = categoryResponse.data.data.id;
                log.info(`Category created with ID: ${categoryId}`);
            } catch (error) {
                log.error('Category creation failed');
                log.error(`Error details: ${JSON.stringify(error.response?.data || error.message)}`);
                
                // Log full error for debugging
                if (error.response) {
                    console.error('Full Error Response:', JSON.stringify(error.response, null, 2));
                }
                
                throw error;
            }

        } catch (error) {
            log.error('Registration or token generation failed');
            log.error(`Error details: ${JSON.stringify(error.response?.data || error.message)}`);
            throw error;
        }

        log.section('All tests completed successfully! 🎉');
        
    } catch (error) {
        console.error('\n❌ Test failed:', JSON.stringify(error.response?.data || error.message));
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
        process.exit(1);
    }
};

// Run the tests
log.section('Starting Backend Tests...');
testBackend().catch(console.error);