declare const _exports: ReportService;
export = _exports;
declare class ReportService {
    generateSpendingReport(userId: any, startDate: any, endDate: any): Promise<{
        totalSpending: any;
        spendingByCategory: any;
        spendingByStore: any;
        receiptCount: any;
        startDate: any;
        endDate: any;
    }>;
}
