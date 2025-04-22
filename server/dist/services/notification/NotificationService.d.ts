declare const _exports: NotificationService;
export = _exports;
declare class NotificationService {
    notificationsCollection: any;
    preferencesCollection: any;
    notificationTypes: {
        STOCK_ALERT: string;
        PRICE_CHANGE: string;
        REORDER: string;
        EXPIRY: string;
        SYSTEM: string;
    };
    priorities: {
        LOW: string;
        MEDIUM: string;
        HIGH: string;
        CRITICAL: string;
    };
    sendNotification(userId: any, notification: any): Promise<{
        userId: any;
        type: any;
        title: any;
        message: any;
        priority: any;
        metadata: any;
        status: string;
        createdAt: Date;
        scheduledFor: any;
        channels: any;
        read: boolean;
        readAt: null;
        id: any;
    } | null>;
    _sendEmail(notification: any): Promise<void>;
    _sendPushNotification(notification: any): Promise<void>;
    _getDefaultPreferences(): {
        channels: {
            email: boolean;
            push: boolean;
            sms: boolean;
        };
        types: {
            [x: string]: boolean;
        };
        priorities: {
            [x: string]: boolean;
        };
        categories: {
            inventory: boolean;
            pricing: boolean;
            quality: boolean;
            security: boolean;
        };
        thresholds: {
            lowStock: number;
            criticalStock: number;
            reorderPoint: number;
        };
        schedules: {
            dailyDigest: boolean;
            weeklyReport: boolean;
        };
        createdAt: Date;
        updatedAt: Date;
    };
    updateChannelPreference(userId: any, channel: any, enabled: any): Promise<any>;
    getUserPreferences(userId: any): Promise<any>;
    updatePreferences(userId: any, preferences: any): Promise<any>;
    getNotifications(userId: any, options?: {}): Promise<any>;
    markAsRead(userId: any, notificationId: any): Promise<boolean>;
}
