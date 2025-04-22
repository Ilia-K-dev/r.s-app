"use strict";
const { auth, admin, db } = require('../../../config/firebase'); //good
const { AppError } = require('../../utils/error/AppError'); //good
const logger = require('../../utils/logger'); //good
class AuthenticationService {
    constructor() {
        this.usersCollection = db.collection('users');
        this.defaultUserPreferences = {
            notifications: {
                email: true,
                push: true,
                sms: false
            },
            categories: {
                inventory: true,
                pricing: true,
                quality: true
            },
            thresholds: {
                lowStock: 20,
                criticalStock: 10,
                reorderPoint: 30
            }
        };
    }
    async register(userData) {
        try {
            // Verify Firebase initialization
            if (!auth || !auth.createUser) {
                logger.error('Firebase Auth not properly initialized');
                throw new AppError('Authentication service not configured', 500);
            }
            const { email, password, name } = userData;
            // Check if user exists
            try {
                const existingUser = await auth.getUserByEmail(email);
                if (existingUser) {
                    throw new AppError('Email already in use', 400);
                }
            }
            catch (error) {
                if (error.code !== 'auth/user-not-found') {
                    throw error;
                }
            }
            // Create user in Firebase Authentication
            const userRecord = await auth.createUser({
                email,
                password,
                displayName: name,
                emailVerified: false
            });
            // Create user document in Firestore
            const userDoc = {
                id: userRecord.uid,
                email: userRecord.email,
                name: userRecord.displayName,
                preferences: this.defaultUserPreferences,
                createdAt: new Date(),
                lastLogin: null,
                status: 'active'
            };
            await this.usersCollection.doc(userRecord.uid).set(userDoc);
            // Generate custom token for immediate login
            const customToken = await auth.createCustomToken(userRecord.uid);
            return {
                user: userDoc,
                token: customToken
            };
        }
        catch (error) {
            logger.error('Registration error:', error);
            throw new AppError(error.message, error.code === 'auth/email-already-exists' ? 400 : 500);
        }
    }
    async login(credentials) {
        try {
            const { email, password } = credentials;
            // Verify user exists
            const userRecord = await auth.getUserByEmail(email);
            // Generate custom token
            const customToken = await auth.createCustomToken(userRecord.uid);
            // Update user login timestamp
            await this.usersCollection.doc(userRecord.uid).update({
                lastLogin: new Date()
            });
            // Get user data
            const userDoc = await this.usersCollection.doc(userRecord.uid).get();
            return {
                user: {
                    id: userRecord.uid,
                    ...userDoc.data()
                },
                token: customToken
            };
        }
        catch (error) {
            logger.error('Login error:', error);
            throw new AppError('Invalid email or password', 401);
        }
    }
    async verifyToken(token) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            const userDoc = await this.usersCollection.doc(decodedToken.uid).get();
            if (!userDoc.exists) {
                throw new AppError('User not found', 404);
            }
            return {
                user: {
                    id: decodedToken.uid,
                    ...userDoc.data()
                }
            };
        }
        catch (error) {
            logger.error('Token verification error:', error);
            throw new AppError('Invalid or expired token', 401);
        }
    }
    async updateProfile(userId, updateData) {
        try {
            const allowedUpdates = ['name', 'preferences'];
            const updates = {};
            Object.keys(updateData).forEach(key => {
                if (allowedUpdates.includes(key)) {
                    updates[key] = updateData[key];
                }
            });
            await this.usersCollection.doc(userId).update({
                ...updates,
                updatedAt: new Date()
            });
            const userDoc = await this.usersCollection.doc(userId).get();
            return {
                user: {
                    id: userId,
                    ...userDoc.data()
                }
            };
        }
        catch (error) {
            logger.error('Profile update error:', error);
            throw new AppError('Failed to update profile', 500);
        }
    }
    async updatePreferences(userId, preferences) {
        try {
            await this.usersCollection.doc(userId).update({
                'preferences': {
                    ...this.defaultUserPreferences,
                    ...preferences
                },
                updatedAt: new Date()
            });
            return await this.getUserPreferences(userId);
        }
        catch (error) {
            logger.error('Preferences update error:', error);
            throw new AppError('Failed to update preferences', 500);
        }
    }
    async getUserPreferences(userId) {
        try {
            const userDoc = await this.usersCollection.doc(userId).get();
            if (!userDoc.exists) {
                throw new AppError('User not found', 404);
            }
            return userDoc.data().preferences || this.defaultUserPreferences;
        }
        catch (error) {
            logger.error('Get preferences error:', error);
            throw new AppError('Failed to get preferences', 500);
        }
    }
    async resetPassword(email) {
        try {
            await auth.generatePasswordResetLink(email);
            return true;
        }
        catch (error) {
            logger.error('Password reset error:', error);
            throw new AppError('Failed to initiate password reset', 500);
        }
    }
}
module.exports = new AuthenticationService();
