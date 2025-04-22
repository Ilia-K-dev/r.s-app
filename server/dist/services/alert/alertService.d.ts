declare const _exports: AlertService;
export = _exports;
declare class AlertService {
    alertTypes: {
        LOW_STOCK: {
            priority: string;
            category: string;
            autoResolve: boolean;
        };
        STOCK_OUT: {
            priority: string;
            category: string;
            autoResolve: boolean;
        };
        REORDER_POINT: {
            priority: string;
            category: string;
            autoResolve: boolean;
        };
        PRICE_CHANGE: {
            priority: string;
            category: string;
            autoResolve: boolean;
        };
        EXPIRY_WARNING: {
            priority: string;
            category: string;
            autoResolve: boolean;
        };
        STOCK_DISCREPANCY: {
            priority: string;
            category: string;
            autoResolve: boolean;
        };
    };
    createAlert(data: any): Promise<any>;
    _processAlert(alert: any): Promise<void>;
    resolveAlert(alertId: any, userId: any, resolution: any): Promise<any>;
    getActiveAlerts(userId: any, filters?: {}): Promise<any>;
    _setupEscalation(alert: any): Promise<void>;
    _escalateAlert(alert: any, escalationLevel: any): Promise<{
        alertId: any;
        level: any;
        timestamp: Date;
        notifiedUsers: never[];
        status: string;
    }>;
    _sendEmailAlert(alert: any, email: any): Promise<any>;
    _sendPushAlert(alert: any): Promise<any>;
    _sendSMSAlert(alert: any, phone: any): Promise<any>;
    _generateAlertEmailContent(alert: any): any;
}
