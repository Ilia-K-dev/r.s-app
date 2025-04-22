export interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    error?: string;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
  }
  
  export interface DocumentUploadResponse {
    id: string;
    status: 'uploaded' | 'processing' | 'completed' | 'error';
    imageUrl?: string;
    extractedData?: Record<string, any>;
  }
  
  export interface InventoryItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    vendor: string;
    lastUpdated: Date;
  }
  
  export interface StockMovement {
    id: string;
    itemId: string;
    quantity: number;
    movementType: 'in' | 'out';
    timestamp: Date;
    reason: string;
  }
  
  export interface AnalyticsData {
    totalSpending: number;
    categoryBreakdown: Record<string, number>;
    monthlyTrends: {
      month: string;
      amount: number;
    }[];
    spendingComparison: {
      currentPeriod: number;
      previousPeriod: number;
      change: number;
    };
    budgetComparison: {
      budgetAmount: number;
      actualSpending: number;
      difference: number;
    };
  }
  
  export interface AlertSettings {
    lowStockThreshold: number;
    expiryThreshold: number;
    notificationChannels: string[];
  }