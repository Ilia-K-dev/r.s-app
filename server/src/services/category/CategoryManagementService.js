const { db } = require('../../../config/firebase'); //good
const logger = require('../../utils/logger'); //good
const { AppError } = require('../../utils/error/AppError'); //good

class CategoryManagementService {
  constructor() {
    this.categoriesCollection = db.collection('categories');
    this.defaultCategories = {
      food: {
        color: '#4CAF50',
        icon: 'food',
        subCategories: ['groceries', 'restaurants', 'beverages']
      },
      household: {
        color: '#2196F3',
        icon: 'home',
        subCategories: ['cleaning', 'furniture', 'utilities']
      },
      electronics: {
        color: '#9C27B0',
        icon: 'device',
        subCategories: ['gadgets', 'accessories', 'appliances']
      }
    };
  }

  async createCategory(userId, categoryData) {
    try {
      const { name, color, budget, parentId } = categoryData;

      // Check for existing category
      const existingCategory = await this.categoriesCollection
        .where('userId', '==', userId)
        .where('name', '==', name)
        .where('parentId', '==', parentId || null)
        .get();

      if (!existingCategory.empty) {
        throw new AppError('Category already exists', 400);
      }

      const category = {
        name,
        color: color || '#000000',
        budget: budget || 0,
        parentId: parentId || null,
        userId,
        products: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await this.categoriesCollection.add(category);

      return {
        id: docRef.id,
        ...category
      };
    } catch (error) {
      logger.error('Category creation error:', error);
      throw new AppError(error.message, error.status || 500);
    }
  }

  async getCategories(userId, options = {}) {
    try {
      let query = this.categoriesCollection.where('userId', '==', userId);

      if (options.parentId) {
        query = query.where('parentId', '==', options.parentId);
      }

      const snapshot = await query.get();
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (options.includeProducts) {
        return await this._includeCategoryProducts(categories);
      }

      return categories;
    } catch (error) {
      logger.error('Get categories error:', error);
      throw new AppError('Failed to fetch categories', 500);
    }
  }

  async updateCategory(userId, categoryId, updateData) {
    try {
      const categoryRef = this.categoriesCollection.doc(categoryId);
      const category = await categoryRef.get();

      if (!category.exists) {
        throw new AppError('Category not found', 404);
      }

      if (category.data().userId !== userId) {
        throw new AppError('Not authorized', 403);
      }

      const allowedUpdates = ['name', 'color', 'budget', 'parentId'];
      const updates = {};

      Object.keys(updateData).forEach(key => {
        if (allowedUpdates.includes(key)) {
          updates[key] = updateData[key];
        }
      });

      updates.updatedAt = new Date();

      await categoryRef.update(updates);

      return {
        id: categoryId,
        ...category.data(),
        ...updates
      };
    } catch (error) {
      logger.error('Category update error:', error);
      throw new AppError(error.message, error.status || 500);
    }
  }

  async deleteCategory(userId, categoryId) {
    try {
      const categoryRef = this.categoriesCollection.doc(categoryId);
      const category = await categoryRef.get();

      if (!category.exists) {
        throw new AppError('Category not found', 404);
      }

      if (category.data().userId !== userId) {
        throw new AppError('Not authorized', 403);
      }

      // Check for subcategories
      const subcategories = await this.categoriesCollection
        .where('parentId', '==', categoryId)
        .get();

      if (!subcategories.empty) {
        throw new AppError('Cannot delete category with subcategories', 400);
      }

      // Move products to uncategorized
      const productsRef = db.collection('products');
      const productsInCategory = await productsRef
        .where('categoryId', '==', categoryId)
        .get();

      const batch = db.batch();
      productsInCategory.docs.forEach(doc => {
        batch.update(doc.ref, { categoryId: null });
      });

      // Delete category
      batch.delete(categoryRef);
      await batch.commit();

      return true;
    } catch (error) {
      logger.error('Category deletion error:', error);
      throw new AppError(error.message, error.status || 500);
    }
  }

  async initializeDefaultCategories(userId) {
    try {
      const batch = db.batch();
      const defaultCats = [];

      for (const [key, value] of Object.entries(this.defaultCategories)) {
        const categoryRef = this.categoriesCollection.doc();
        const category = {
          name: key,
          color: value.color,
          icon: value.icon,
          userId,
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        batch.set(categoryRef, category);
        defaultCats.push({ id: categoryRef.id, ...category });

        // Create subcategories
        for (const subCat of value.subCategories) {
          const subCategoryRef = this.categoriesCollection.doc();
          const subCategory = {
            name: subCat,
            color: value.color,
            icon: value.icon,
            userId,
            parentId: categoryRef.id,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          batch.set(subCategoryRef, subCategory);
          defaultCats.push({ id: subCategoryRef.id, ...subCategory });
        }
      }

      await batch.commit();
      return defaultCats;
    } catch (error) {
      logger.error('Default categories initialization error:', error);
      throw new AppError('Failed to initialize default categories', 500);
    }
  }

  async _includeCategoryProducts(categories) {
    const productsRef = db.collection('products');
    
    return await Promise.all(categories.map(async category => {
      const products = await productsRef
        .where('categoryId', '==', category.id)
        .get();

      return {
        ...category,
        products: products.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      };
    }));
  }
}

module.exports = new CategoryManagementService();