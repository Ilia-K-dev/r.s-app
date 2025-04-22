export class TestDataGenerator {
    static generateUser(overrides?: {}): {
        email: any;
        name: any;
        preferences: {
            notifications: boolean;
            theme: string;
        };
    };
    static generateReceipt(userId: any, overrides?: {}): {
        userId: any;
        merchant: any;
        total: number;
        date: string;
        items: {
            name: any;
            price: number;
            quantity: any;
        }[];
    };
    static createTestUser(): Promise<{
        email: any;
        name: any;
        preferences: {
            notifications: boolean;
            theme: string;
        };
        id: any;
    }>;
}
export class TestValidator {
    static validateSchema(data: any, schema: any): {
        isValid: boolean;
        errors: any[];
    };
}
export class IntegrationTestRunner {
    constructor(testSuite: any);
    testSuite: any;
    results: {
        passed: number;
        failed: number;
        skipped: number;
    };
    run(): Promise<{
        passed: number;
        failed: number;
        skipped: number;
    }>;
    generateReport(): void;
}
