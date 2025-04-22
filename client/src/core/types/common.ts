export interface DocumentItem {
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    category: string;
  }
  
  export interface Receipt {
    id: string;
    vendor: string;
    date: Date;
    items: DocumentItem[];
    totalAmount: number;
    tax: number;
    paymentMethod: string;
    notes: string;
  }
  
  export interface InventoryFilter {
    category?: string;
    vendor?: string;
    minQuantity?: number;
    maxQuantity?: number;
    expiryDate?: Date;
  }
  
  export interface DateRange {
    startDate: Date;
    endDate: Date;
  }
  
  export interface BudgetCategory {
    id: string;
    name: string;
    budgetAmount: number;
    actualSpending: number;
  }
  
  export interface UserSettings {
    id: string;
    userId: string;
    defaultCategory: string;
    lowStockThreshold: number;
    expiryThreshold: number;
    notificationChannels: string[];
  }