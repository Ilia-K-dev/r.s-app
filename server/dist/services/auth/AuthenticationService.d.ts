declare const _exports: AuthenticationService;
export = _exports;
declare class AuthenticationService {
    usersCollection: any;
    defaultUserPreferences: {
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
        };
        categories: {
            inventory: boolean;
            pricing: boolean;
            quality: boolean;
        };
        thresholds: {
            lowStock: number;
            criticalStock: number;
            reorderPoint: number;
        };
    };
    register(userData: any): Promise<{
        user: {
            id: any;
            email: any;
            name: any;
            preferences: {
                notifications: {
                    email: boolean;
                    push: boolean;
                    sms: boolean;
                };
                categories: {
                    inventory: boolean;
                    pricing: boolean;
                    quality: boolean;
                };
                thresholds: {
                    lowStock: number;
                    criticalStock: number;
                    reorderPoint: number;
                };
            };
            createdAt: Date;
            lastLogin: null;
            status: string;
        };
        token: any;
    }>;
    login(credentials: any): Promise<{
        user: any;
        token: any;
    }>;
    verifyToken(token: any): Promise<{
        user: any;
    }>;
    updateProfile(userId: any, updateData: any): Promise<{
        user: any;
    }>;
    updatePreferences(userId: any, preferences: any): Promise<any>;
    getUserPreferences(userId: any): Promise<any>;
    resetPassword(email: any): Promise<boolean>;
}
