const { Category } = require('../src/models/Category');//good
const { TestDataGenerator } = require('../src/utils/misc/testUtils'); //good

describe('Category System Tests', () => {
  let testUser;

  beforeAll(async () => {
    testUser = await TestDataGenerator.createTestUser();
  });

  describe('Category Creation', () => {
    test('should create a new category', async () => {
      const categoryData = {
        userId: testUser.id,
        name: 'Groceries',
        color: '#FF5733',
        budget: 500
      };

      const category = new Category(categoryData);
      await category.save();

      expect(category).toHaveProperty('id');
      expect(category.name).toBe('Groceries');
    });
  });

  describe('Category Management', () => {
    test('should update category', async () => {
      const categories = await Category.findByUserId(testUser.id);
      const groceryCategory = categories.find(c => c.name === 'Groceries');

      groceryCategory.budget = 600;
      await groceryCategory.save();

      expect(groceryCategory.budget).toBe(600);
    });

    test('should delete category', async () => {
      const categories = await Category.findByUserId(testUser.id);
      const categoryToDelete = categories.find(c => c.name === 'Groceries');

      await Category.delete(categoryToDelete.id);

      const remainingCategories = await Category.findByUserId(testUser.id);
      expect(remainingCategories).not.toContain(categoryToDelete);
    });
  });

  describe('Category Validation', () => {
    test('should not create category with invalid data', async () => {
      const invalidCategory = new Category({
        userId: testUser.id,
        name: '', // Invalid empty name
        color: 'invalid-color'
      });

      await expect(invalidCategory.save()).rejects.toThrow();
    });
  });

  describe('Category Hierarchy', () => {
    test('should create nested categories', async () => {
      const parentCategory = new Category({
        userId: testUser.id,
        name: 'Food',
        subcategories: [
          { name: 'Fruits', color: '#GREEN' },
          { name: 'Vegetables', color: '#RED' }
        ]
      });

      await parentCategory.save();

      expect(parentCategory.subcategories).toHaveLength(2);
      expect(parentCategory.subcategories[0].name).toBe('Fruits');
    });
  });
});