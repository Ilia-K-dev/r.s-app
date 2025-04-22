"use strict";
const { auth, admin, db } = require('../../config/firebase'); //good
const { AppError } = require('../utils/error/AppError'); //good
const User = require('../models/User'); //good
const { validateAuth } = require('../utils/validation/validators'); //good
const authController = {
    async register(req, res, next) {
        try {
            // Comprehensive Firebase diagnostics
            console.log('🔍 Firebase Diagnostic Checks:');
            console.log('Auth Object Exists:', !!auth);
            console.log('Admin Object Exists:', !!admin);
            console.log('Firebase Apps:', admin.apps.length);
            try {
                // Additional auth object diagnostics
                console.log('Auth Object Keys:', Object.keys(auth));
                console.log('Available Auth Methods:', Object.keys(auth).filter(key => typeof auth[key] === 'function'));
            }
            catch (diagError) {
                console.error('Diagnostic logging error:', diagError);
            }
            const { email, password } = req.body;
            // Input validation
            if (!email || !password) {
                throw new AppError('Email and password are required', 400);
            }
            // Enhanced logging for registration attempt
            console.log(`Registration attempt for email: ${email}`);
            try {
                // Verify Firebase initialization
                if (!auth || !auth.createUser) {
                    console.error('❌ Firebase Auth is not properly initialized');
                    throw new AppError('Firebase Authentication is not configured', 500);
                }
                // Check if user already exists with more robust error handling
                let existingUser;
                try {
                    existingUser = await auth.getUserByEmail(email);
                }
                catch (error) {
                    // Only continue if the error is specifically user-not-found
                    if (error.code !== 'auth/user-not-found') {
                        console.error('Unexpected error during user existence check:', error);
                        throw error;
                    }
                }
                if (existingUser) {
                    console.warn(`Registration attempt with existing email: ${email}`);
                    throw new AppError('Email already in use', 400);
                }
                // Create user in Firebase Authentication with additional error handling
                let userRecord;
                try {
                    userRecord = await auth.createUser({
                        email,
                        password,
                        emailVerified: false
                    });
                    console.log(`User created successfully: ${userRecord.uid}`);
                }
                catch (firebaseCreateError) {
                    console.error('Firebase user creation error:', firebaseCreateError);
                    // Specific error handling for common Firebase authentication errors
                    if (firebaseCreateError.code === 'auth/email-already-exists') {
                        throw new AppError('Email already in use', 400);
                    }
                    if (firebaseCreateError.code === 'auth/invalid-email') {
                        throw new AppError('Invalid email format', 400);
                    }
                    if (firebaseCreateError.code === 'auth/operation-not-allowed') {
                        throw new AppError('User registration is currently disabled', 403);
                    }
                    if (firebaseCreateError.code === 'auth/weak-password') {
                        throw new AppError('Password is too weak', 400);
                    }
                    // Fallback error for unexpected Firebase errors
                    throw new AppError(`User creation failed: ${firebaseCreateError.message}`, 500);
                }
                // Generate custom token for immediate login
                let customToken;
                try {
                    customToken = await auth.createCustomToken(userRecord.uid);
                    console.log(`Custom token generated for user: ${userRecord.uid}`);
                }
                catch (tokenError) {
                    console.error('Custom token generation error:', tokenError);
                    throw new AppError('Failed to generate authentication token', 500);
                }
                // Create user document in Firestore
                const user = new User({
                    id: userRecord.uid,
                    email: userRecord.email,
                    preferences: {},
                    createdAt: new Date()
                });
                try {
                    await user.save();
                    console.log(`User document created in Firestore: ${user.id}`);
                }
                catch (firestoreError) {
                    console.error('Firestore user document creation error:', firestoreError);
                    // Optional: You might want to delete the Firebase user if Firestore save fails
                    await auth.deleteUser(userRecord.uid);
                    throw new AppError('Failed to complete user registration', 500);
                }
                res.status(201).json({
                    status: 'success',
                    data: {
                        uid: userRecord.uid,
                        email: userRecord.email,
                        token: customToken
                    }
                });
            }
            catch (error) {
                console.error('Registration process error:', error);
                next(error instanceof AppError ? error : new AppError('Registration failed', 500));
            }
        }
        catch (error) {
            console.error('Unexpected registration error:', error);
            next(new AppError(error.message || 'Registration failed', 500));
        }
    },
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                throw new AppError('Email and password are required', 400);
            }
            // Enhanced logging for login attempt
            console.log(`Login attempt for email: ${email}`);
            try {
                // Use Firebase Admin to verify credentials
                const userRecord = await auth.getUserByEmail(email);
                // Generate custom token for client authentication
                const customToken = await auth.createCustomToken(userRecord.uid);
                // Get user data from Firestore
                const user = await User.findById(userRecord.uid);
                if (!user) {
                    // Create user document if it doesn't exist
                    const newUser = new User({
                        id: userRecord.uid,
                        email: userRecord.email,
                        preferences: {},
                        createdAt: new Date()
                    });
                    await newUser.save();
                    console.log(`Created new user document for login: ${userRecord.uid}`);
                }
                res.status(200).json({
                    status: 'success',
                    data: {
                        uid: userRecord.uid,
                        email: userRecord.email,
                        token: customToken,
                        preferences: user ? user.preferences : {}
                    }
                });
            }
            catch (error) {
                console.error('Login authentication error:', error);
                throw new AppError('Invalid email or password', 401);
            }
        }
        catch (error) {
            console.error('Login error:', error);
            next(new AppError(error.message || 'Login failed', error.status || 401));
        }
    },
    async verifyToken(req, res, next) {
        try {
            const { token } = req.body;
            if (!token) {
                throw new AppError('Token is required', 400);
            }
            // Enhanced logging for token verification
            console.log('Token verification attempt');
            try {
                const decodedToken = await auth.verifyIdToken(token);
                // Get updated user data
                const user = await User.findById(decodedToken.uid);
                if (!user) {
                    // Create user document if it doesn't exist
                    const userRecord = await auth.getUser(decodedToken.uid);
                    const newUser = new User({
                        id: decodedToken.uid,
                        email: userRecord.email,
                        preferences: {},
                        createdAt: new Date()
                    });
                    await newUser.save();
                    console.log(`Created new user document during token verification: ${decodedToken.uid}`);
                }
                // Generate new custom token
                const newToken = await auth.createCustomToken(decodedToken.uid);
                res.status(200).json({
                    status: 'success',
                    data: {
                        uid: decodedToken.uid,
                        email: decodedToken.email,
                        token: newToken,
                        preferences: user ? user.preferences : {}
                    }
                });
            }
            catch (error) {
                console.error('Token verification failed:', error);
                throw new AppError('Invalid or expired token', 401);
            }
        }
        catch (error) {
            console.error('Token verification error:', error);
            next(new AppError(error.message || 'Token verification failed', error.status || 401));
        }
    }
};
module.exports = authController;
