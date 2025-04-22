const { AdvancedAnalyticsService } = require('../src/services/analytics/analyticsService');//good
const { TestDataGenerator } = require('../src/utils/misc/testUtils'); //good

describe('Analytics Calculation Tests', () => {
  let testUser;
  let analyticsService;

  beforeAll(async () => {
    testUser = await TestDataGenerator.createTestUser();
    analyticsService = new AdvancedAnalyticsService();
    
    // Generate test data
    await TestDataGenerator.generateTestPurchases(testUser.id);
  });

  describe('Vendor Comparison', () => {
    test('should calculate vendor spending comparison', async () => {
      const vendorComparison = await analyticsService.getVendorComparison(
        testUser.id, 
        { startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      );

      expect(vendorComparison).toBeInstanceOf(Array);
      expect(vendorComparison[0]).toHaveProperty('vendorName');
      expect(vendorComparison[0]).toHaveProperty('totalSpending');
    });
  });

  describe('Price Tracking', () => {
    test('should track product price trends', async () => {
      const testProduct = await TestDataGenerator.createTestProduct(testUser.id);
      
      const priceTracking = await analyticsService.getPriceTracking(
        testUser.id, 
        testProduct.id
      );

      expect(priceTracking).toHaveProperty('priceHistory');
      expect(priceTracking).toHaveProperty('trends');
      expect(priceTracking.trends).toHaveProperty('average');
      expect(priceTracking.trends).toHaveProperty('volatility');
    });
  });

  describe('Spending Analysis', () => {
    test('should calculate monthly spending', async () => {
      const monthlySpending = await analyticsService.getMonthlySpending(
        testUser.id, 
        new Date().getFullYear()
      );

      expect(monthlySpending).toBeInstanceOf(Array);
      expect(monthlySpending.length).toBe(12);
      expect(monthlySpending[0]).toHaveProperty('month');
      expect(monthlySpending[0]).toHaveProperty('total');
    });
  });
});