"use strict";
const { db } = require('../../config/firebase'); //good
class Category {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.userId = data.userId;
        this.color = data.color || '#000000';
        this.budget = data.budget || 0;
        this.createdAt = data.createdAt || new Date();
    }
    static async findByUserId(userId) {
        try {
            const snapshot = await db.collection('categories')
                .where('userId', '==', userId)
                .get();
            return snapshot.docs.map(doc => new Category({ id: doc.id, ...doc.data() }));
        }
        catch (error) {
            throw error;
        }
    }
    async save() {
        try {
            const categoryRef = this.id ?
                db.collection('categories').doc(this.id) :
                db.collection('categories').doc();
            this.id = categoryRef.id;
            await categoryRef.set(this.toJSON(), { merge: true });
            return this;
        }
        catch (error) {
            throw error;
        }
    }
    toJSON() {
        return {
            name: this.name,
            userId: this.userId,
            color: this.color,
            budget: this.budget,
            createdAt: this.createdAt
        };
    }
}
module.exports = Category;
