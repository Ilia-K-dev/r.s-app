"use strict";
const express = require('express');
const router = express.Router();
const { admin, db } = require('../../config/firebase'); // good
// Firebase connection test
router.get('/check-firebase', async (req, res) => {
    try {
        const testDoc = await db.collection('_test').doc('test').set({
            test: true,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        await db.collection('_test').doc('test').delete();
        res.json({
            status: 'success',
            message: 'Firebase connection successful',
            firestore: true,
            auth: !!admin.auth(),
            apps: admin.apps.length
        });
    }
    catch (error) {
        console.error('Firebase check error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message,
            stack: error.stack
        });
    }
});
// Service account permissions check
router.get('/check-permissions', async (req, res) => {
    try {
        const authCheck = await admin.auth().listUsers(1);
        const firestoreCheck = await db.collection('_test').doc('permissions_check').set({
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        await db.collection('_test').doc('permissions_check').delete();
        res.json({
            status: 'success',
            checks: {
                auth: true,
                firestore: true,
                projectId: process.env.FIREBASE_PROJECT_ID,
                serviceAccount: {
                    exists: true,
                    email: process.env.FIREBASE_CLIENT_EMAIL,
                    hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY
                }
            }
        });
    }
    catch (error) {
        console.error('Permission check error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message,
            stack: error.stack
        });
    }
});
module.exports = router;
