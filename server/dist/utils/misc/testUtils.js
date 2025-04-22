"use strict";
const { db } = require('/server/config/firebase'); //good
const faker = require('faker');
class TestDataGenerator {
    static generateUser(overrides = {}) {
        return {
            email: faker.internet.email(),
            name: faker.name.findName(),
            preferences: {
                notifications: true,
                theme: 'light'
            },
            ...overrides
        };
    }
    static generateReceipt(userId, overrides = {}) {
        return {
            userId,
            merchant: faker.company.companyName(),
            total: parseFloat(faker.commerce.price()),
            date: new Date().toISOString(),
            items: [
                {
                    name: faker.commerce.productName(),
                    price: parseFloat(faker.commerce.price()),
                    quantity: faker.random.number({ min: 1, max: 5 })
                }
            ],
            ...overrides
        };
    }
    static async createTestUser() {
        const user = this.generateUser();
        const userRef = await db.collection('users').add(user);
        return { id: userRef.id, ...user };
    }
}
class TestValidator {
    static validateSchema(data, schema) {
        const errors = [];
        Object.keys(schema).forEach(key => {
            const rules = schema[key];
            const value = data[key];
            if (rules.required && !value) {
                errors.push(`${key} is required`);
            }
            if (value && rules.type && typeof value !== rules.type) {
                errors.push(`${key} must be of type ${rules.type}`);
            }
            if (value && rules.min && value < rules.min) {
                errors.push(`${key} must be at least ${rules.min}`);
            }
            if (value && rules.max && value > rules.max) {
                errors.push(`${key} must be at most ${rules.max}`);
            }
        });
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
class IntegrationTestRunner {
    constructor(testSuite) {
        this.testSuite = testSuite;
        this.results = {
            passed: 0,
            failed: 0,
            skipped: 0
        };
    }
    async run() {
        console.log('Starting Integration Test Suite');
        for (const testCase of this.testSuite) {
            try {
                await testCase.setup();
                await testCase.execute();
                await testCase.cleanup();
                this.results.passed++;
                console.log(`✅ ${testCase.name} PASSED`);
            }
            catch (error) {
                this.results.failed++;
                console.error(`❌ ${testCase.name} FAILED:`, error);
            }
        }
        this.generateReport();
        return this.results;
    }
    generateReport() {
        console.log('\n--- Test Suite Report ---');
        console.log(`Passed: ${this.results.passed}`);
        console.log(`Failed: ${this.results.failed}`);
        console.log(`Skipped: ${this.results.skipped}`);
    }
}
module.exports = {
    TestDataGenerator,
    TestValidator,
    IntegrationTestRunner
};
