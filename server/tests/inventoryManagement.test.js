const { Inventory } = require('../src/models/Inventory');//good
const { Product } = require('../src/models/Product');//good
const { TestDataGenerator } = require('../src/utils/misc/testUtils');//good

describe('Inventory Management Tests', () => {
  let testUser;
  let testProduct;

  beforeAll(async () => {
    testUser = await TestDataGenerator.createTestUser();
    testProduct = await TestDataGenerator.createTestProduct(testUser.id);
  });

  describe('Inventory Item Creation', () => {
    test('should create inventory item', async () => {
      const inventoryItem = new Inventory({
        userId: testUser.id,
        productId: testProduct.id,
        quantity: 100,
        unit: 'piece',
        reorderPoint: 20
      });

      await inventoryItem.save();

      expect(inventoryItem).toHaveProperty('id');
      expect(inventoryItem.quantity).toBe(100);
      expect(inventoryItem.status).toBe('in_stock');
    });
  });

  describe('Stock Level Management', () => {
    test('should update quantity and change status', async () => {
      const inventoryItem = await Inventory.findByProduct(testUser.id, testProduct.id);
      
      inventoryItem.updateQuantity(-90);
      await inventoryItem.save();

      expect(inventoryItem.quantity).toBe(10);
      expect(inventoryItem.status).toBe('low_stock');
    });

    test('should trigger low stock alert', async () => {
      const inventoryItem = await Inventory.findByProduct(testUser.id, testProduct.id);
      
      inventoryItem.updateQuantity(-10);
      await inventoryItem.save();

      expect(inventoryItem.status).toBe('out_of_stock');
    });
  });

  describe('Batch Operations', () => {
    test('should perform bulk inventory updates', async () => {
      const batchUpdates = [
        { productId: testProduct.id, quantityChange: -10 },
        { productId: testProduct.id, quantityChange: 50 }
      ];

      const updatedInventories = await Inventory.batchUpdate(
        testUser.id, 
        batchUpdates
      );

      expect(updatedInventories.length).toBe(2);
      expect(updatedInventories[0].quantity).toBeLessThan(
        updatedInventories[1].quantity
      );
    });
  });
});