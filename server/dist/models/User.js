"use strict";
// models/User.js
const { db } = require('../../config/firebase'); //good
class User {
    constructor(data) {
        if (!data) {
            throw new Error('User data is required');
        }
        this.id = data.id;
        this.email = data.email;
        this.name = data.name;
        this.preferences = data.preferences || {};
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = new Date();
        this.active = data.active !== undefined ? data.active : true;
        this.lastLoginAt = data.lastLoginAt || null;
        // Validate on creation
        const validationErrors = this.validate();
        if (validationErrors.length > 0) {
            throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
        }
    }
    static async findById(userId) {
        try {
            console.log(`Finding user by ID: ${userId}`);
            if (!userId) {
                throw new Error('User ID is required');
            }
            const doc = await db.collection('users').doc(userId).get();
            if (!doc.exists) {
                console.log(`No user found with ID: ${userId}`);
                return null;
            }
            console.log(`User found: ${userId}`);
            return new User({ id: doc.id, ...doc.data() });
        }
        catch (error) {
            console.error('Error finding user:', error);
            throw error;
        }
    }
    static async findByEmail(email) {
        try {
            console.log(`Finding user by email: ${email}`);
            if (!email) {
                throw new Error('Email is required');
            }
            const snapshot = await db.collection('users')
                .where('email', '==', email)
                .limit(1)
                .get();
            if (snapshot.empty) {
                console.log(`No user found with email: ${email}`);
                return null;
            }
            const doc = snapshot.docs[0];
            console.log(`User found by email: ${email}`);
            return new User({ id: doc.id, ...doc.data() });
        }
        catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }
    async save() {
        try {
            console.log(`Saving user: ${this.id}`);
            // Pre-save validation
            const validationErrors = this.validate();
            if (validationErrors.length > 0) {
                throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
            }
            const userRef = db.collection('users').doc(this.id);
            // Update timestamp
            this.updatedAt = new Date();
            const userData = this.toJSON();
            console.log('Saving user data:', userData);
            await userRef.set(userData, { merge: true });
            console.log(`User saved successfully: ${this.id}`);
            return this;
        }
        catch (error) {
            console.error('Error saving user:', error);
            throw error;
        }
    }
    async update(data) {
        try {
            console.log(`Updating user: ${this.id}`, data);
            // Only update allowed fields
            const allowedUpdates = ['name', 'preferences', 'active'];
            Object.keys(data).forEach(key => {
                if (allowedUpdates.includes(key)) {
                    this[key] = data[key];
                }
            });
            this.updatedAt = new Date();
            return await this.save();
        }
        catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }
    async delete() {
        try {
            console.log(`Deleting user: ${this.id}`);
            if (!this.id) {
                throw new Error('Cannot delete user without ID');
            }
            const userRef = db.collection('users').doc(this.id);
            await userRef.delete();
            console.log(`User deleted successfully: ${this.id}`);
        }
        catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
    async updateLoginTimestamp() {
        try {
            this.lastLoginAt = new Date();
            return await this.save();
        }
        catch (error) {
            console.error('Error updating login timestamp:', error);
            throw error;
        }
    }
    toJSON() {
        return {
            email: this.email,
            name: this.name,
            preferences: this.preferences,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            active: this.active,
            lastLoginAt: this.lastLoginAt
        };
    }
    validate() {
        const errors = [];
        if (!this.id) {
            errors.push('User ID is required');
        }
        if (!this.email) {
            errors.push('Email is required');
        }
        else if (!this.email.includes('@')) {
            errors.push('Invalid email format');
        }
        if (this.preferences && typeof this.preferences !== 'object') {
            errors.push('Preferences must be an object');
        }
        if (this.name && typeof this.name !== 'string') {
            errors.push('Name must be a string');
        }
        return errors;
    }
}
module.exports = User;
