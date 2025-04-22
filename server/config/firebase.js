const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Enhanced detailed error logging function
function logDetailedError(error) {
    console.error('❌ Firebase Initialization Critical Error');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    
    // Comprehensive environment variable diagnostics
    console.error('\n🔍 Environment Variable Diagnostics:');
    console.error('Current Working Directory:', process.cwd());
    console.error('__dirname:', __dirname);
    console.error('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID || 'NOT SET');
    console.error('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL || 'NOT SET');
    console.error('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'Present (Length: ' + process.env.FIREBASE_PRIVATE_KEY.length + ')' : 'NOT SET');
    console.error('FIREBASE_STORAGE_BUCKET:', process.env.FIREBASE_STORAGE_BUCKET || 'NOT SET');
    console.error('FIREBASE_DATABASE_URL:', process.env.FIREBASE_DATABASE_URL || 'NOT SET');
}

// Comprehensive Firebase initialization function
function initializeFirebaseAdmin() {
    console.log('🚀 Starting Firebase Admin Initialization');

    try {
        // Validate required environment variables
        const requiredVars = [
            'FIREBASE_PROJECT_ID', 
            'FIREBASE_CLIENT_EMAIL', 
            'FIREBASE_PRIVATE_KEY',
            'FIREBASE_STORAGE_BUCKET'
        ];

        // Check for missing variables
        const missingVars = requiredVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            throw new Error(`Missing critical Firebase environment variables: ${missingVars.join(', ')}`);
        }

        // Format private key correctly - handle potential escaped newlines
        process.env.FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

        // Prepare Firebase configuration with enhanced error checking
        const firebaseConfig = {
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL
            }),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            databaseURL: process.env.FIREBASE_DATABASE_URL
        };

        // Detailed configuration logging (sanitized)
        console.log('🔍 Firebase Configuration Details:');
        console.log('Project ID:', firebaseConfig.credential.projectId);
        console.log('Client Email:', firebaseConfig.credential.clientEmail);
        console.log('Storage Bucket:', firebaseConfig.storageBucket);
        console.log('Database URL:', firebaseConfig.databaseURL || 'Not configured');

        // Prevent multiple initializations
        if (admin.apps.length > 0) {
            console.log('ℹ️ Firebase already initialized. Returning existing app.');
            return createFirebaseServices();
        }

        // Initialize Firebase Admin with comprehensive error handling
        try {
            admin.initializeApp(firebaseConfig);
            console.log('✅ Firebase Admin Initialized Successfully');
        } catch (initError) {
            console.error('❌ Firebase Initialization Failed:', initError);
            
            // Additional diagnostic information for initialization failure
            console.error('\n🚨 Possible Initialization Issues:');
            console.error('1. Incorrect service account credentials');
            console.error('2. Network connectivity problems');
            console.error('3. Firestore/Authentication not enabled');
            
            throw initError;
        }

        // Create and return Firebase services
        return createFirebaseServices();

    } catch (error) {
        console.error('🚨 Fatal Firebase Configuration Error');
        logDetailedError(error);
        throw error;
    }
}

// Centralized service creation function
function createFirebaseServices() {
    const firebaseServices = {
        admin,
        db: admin.firestore(),
        auth: admin.auth(),
        storage: admin.storage(),
        
        // Enhanced diagnostic method
        diagnose: () => {
            console.log('🔬 Firebase Services Diagnostic Report');
            console.log('Initialized Apps:', admin.apps.length);
            console.log('Project ID:', admin.app().options.projectId);
            console.log('✅ Available Firebase Services:', Object.keys(firebaseServices).filter(key => key !== 'diagnose').join(', '));
            
            // Additional runtime diagnostics
            console.log('\n📊 Runtime Diagnostics:');
            console.log('Memory Usage:', process.memoryUsage());
            console.log('CPU Architecture:', process.arch);
            
            return firebaseServices;
        }
    };

    return firebaseServices;
}

// Export Firebase services with comprehensive error handling
module.exports = (() => {
    try {
        const firebaseServices = initializeFirebaseAdmin();
        console.log('✅ Firebase Services Exported Successfully');
        return firebaseServices;
    } catch (error) {
        console.error('❌ Failed to Export Firebase Services');
        logDetailedError(error);
        
        // Return a mock service to prevent complete application failure
        return {
            error: true,
            message: error.message,
            diagnose: () => {
                console.error('Firebase initialization failed');
                return null;
            }
        };
    }
})();