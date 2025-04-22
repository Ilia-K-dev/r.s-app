const { processReceipt } = require('../src/services/receipts/ReceiptProcessingService');
const { calculateUnitPrice } = require('../src/utils/misc/priceCalculator');

describe('Receipt Parser', () => {
  test('should extract items correctly', () => {
    const testReceipt = `
      WALMART
      123 Main St
      Date: 2024-02-05
      
      Milk 1L    $3.99
      Bread      $2.50
      
      Total:     $6.49
    `;
    
    const result = extractReceiptData(testReceipt);
    expect(result.storeName).toBe('WALMART');
    expect(result.items.length).toBe(2);
    expect(result.total).toBe(6.49);
  });
});