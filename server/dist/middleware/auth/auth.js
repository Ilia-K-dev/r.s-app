"use strict";
const { admin } = require('../../../config/firebase'); //good
const { AppError } = require('../../utils/error/AppError'); //good
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No authentication token provided', 401);
        }
        const token = authHeader.split(' ')[1];
        try {
            // Detailed token verification
            console.log('Attempting to verify token:', token.substring(0, 20) + '...');
            // Verify the token, passing true to check if the token is still valid
            const decodedToken = await admin.auth().verifyIdToken(token, true);
            console.log('Token verified successfully');
            console.log('Decoded Token:', {
                uid: decodedToken.uid,
                email: decodedToken.email
            });
            // Attach user information to the request
            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email
            };
            next();
        }
        catch (verifyError) {
            // Detailed error logging
            console.error('Token Verification Error:', {
                name: verifyError.name,
                message: verifyError.message,
                code: verifyError.code
            });
            // Comprehensive error handling
            if (verifyError.code === 'auth/id-token-expired') {
                throw new AppError('Token has expired', 401);
            }
            else if (verifyError.code === 'auth/invalid-id-token') {
                throw new AppError('Invalid token', 401);
            }
            else {
                // Log the full error for debugging
                console.error('Unexpected verification error:', verifyError);
                throw new AppError('Authentication failed', 401);
            }
        }
    }
    catch (error) {
        // Ensure any unexpected errors are properly handled
        console.error('Authentication middleware error:', error);
        next(error);
    }
};
module.exports = {
    authenticateUser
};
