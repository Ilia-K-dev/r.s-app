import {
  calculateSpendingByCategory,
  calculateMonthlySpending,
  calculateTopMerchants,
  calculateInventoryValueTrend,
  calculateInventoryTurnover
} from '../calculators';

// Mock receipt data
const mockReceipts = [
  {
    id: 'receipt1',
    userId: 'user1',
    merchant: 'Grocery Store',
    total: 50.25,
    category: 'Groceries',
    date: new Date('2023-01-15')
  },
  {
    id: 'receipt2',
    userId: 'user1',
    merchant: 'Restaurant',
    total: 75.00,
    category: 'Dining',
    date: new Date('2023-02-10')
  },
  {
    id: 'receipt3',
    userId: 'user1',
    merchant: 'Grocery Store',
    total: 35.50,
    category: 'Groceries',
    date: new Date('2023-03-05')
  }
];

// Mock inventory data
const mockInventory = [
  {
    id: 'item1',
    userId: 'user1',
    name: 'Product A',
    quantity: 10,
    unitCost: 5.00
  },
  {
    id: 'item2',
    userId: 'user1',
    name: 'Product B',
    quantity: 5,
    unitCost: 10.00
  }
];

// Mock stock movements
const mockStockMovements = [
  {
    id: 'movement1',
    userId: 'user1',
    inventoryId: 'item1',
    quantity: 2,
    type: 'remove',
    timestamp: new Date('2023-01-10')
  },
  {
    id: 'movement2',
    userId: 'user1',
    inventoryId: 'item2',
    quantity: 1,
    type: 'remove',
    timestamp: new Date('2023-01-15')
  },
  {
    id: 'movement3',
    userId: 'user1',
    inventoryId: 'item1',
    quantity: 5,
    type: 'add',
    timestamp: new Date('2023-02-01')
  }
];

describe('Analytics Calculators', () => {
  test('calculateSpendingByCategory groups receipts by category', () => {
    const result = calculateSpendingByCategory(mockReceipts);

    // Expected: Groceries = 85.75, Dining = 75.00
    expect(result).toHaveLength(2);

    // Find the Groceries category
    const groceries = result.find(item => item.category === 'Groceries');
    expect(groceries).toBeDefined();
    expect(groceries.amount).toBeCloseTo(85.75);

    // Find the Dining category
    const dining = result.find(item => item.category === 'Dining');
    expect(dining).toBeDefined();
    expect(dining.amount).toBeCloseTo(75.00);
  });

  test('calculateMonthlySpending groups receipts by month', () => {
    const result = calculateMonthlySpending(mockReceipts);

    // We should have entries for all 12 months
    expect(result).toHaveLength(12);

    // Check the months with expenses
    const january = result.find(item => item.month === 'Jan');
    expect(january).toBeDefined();
    expect(january.amount).toBeCloseTo(50.25);

    const february = result.find(item => item.month === 'Feb');
    expect(february).toBeDefined();
    expect(february.amount).toBeCloseTo(75.00);

    const march = result.find(item => item.month === 'Mar');
    expect(march).toBeDefined();
    expect(march.amount).toBeCloseTo(35.50);
  });

  test('calculateTopMerchants ranks merchants by total spending', () => {
    const result = calculateTopMerchants(mockReceipts, 2);

    // Should have 2 merchants max (as specified by limit)
    expect(result).toHaveLength(2);

    // First merchant should be Grocery Store with total 85.75
    expect(result[0].merchant).toBe('Grocery Store');
    expect(result[0].total).toBeCloseTo(85.75);
    expect(result[0].count).toBe(2);

    // Second merchant should be Restaurant with total 75.00
    expect(result[1].merchant).toBe('Restaurant');
    expect(result[1].total).toBeCloseTo(75.00);
    expect(result[1].count).toBe(1);
  });

  test('calculateInventoryTurnover calculates the turnover ratio correctly', () => {
    const result = calculateInventoryTurnover(mockInventory, mockStockMovements);

    // Calculate expected values manually
    // COGS = (2 * 5.00) + (1 * 10.00) = 20.00
    // Average Inventory Value = (10 * 5.00) + (5 * 10.00) = 100.00
    // Turnover = 20.00 / 100.00 = 0.20

    expect(result.cogs).toBeCloseTo(20.00);
    expect(result.averageInventoryValue).toBeCloseTo(100.00);
    expect(result.turnover).toBeCloseTo(0.20);
  });
});
