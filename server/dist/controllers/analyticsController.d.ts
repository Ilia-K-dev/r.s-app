export function getPriceAnalytics(req: any, res: any, next: any): Promise<void>;
export function getSpendingAnalysis(req: any, res: any, next: any): Promise<void>;
export function getVendorAnalysis(req: any, res: any, next: any): Promise<void>;
export function getInventoryAnalytics(req: any, res: any, next: any): Promise<void>;
export function getCategoryAnalysis(req: any, res: any, next: any): Promise<void>;
export function getDashboardAnalytics(req: any, res: any, next: any): Promise<void>;
export function getPriceComparisonReport(req: any, res: any, next: any): Promise<void>;
export function _calculateMovingAverage(data: any, window: any): {
    month: any;
    amount: number;
}[];
export function _calculateTrend(data: any): {
    slope: number;
    intercept: number;
};
export function _calculatePredictionConfidence(historical: any, predictedValue: any): number;
