class CategoryService extends BaseService {
  constructor() {
    super();
    this.db = require('../../../config/firebase').db;
  }
  
  async getCategories(userId) {
    const snapshot = await this.db
      .collection('categories')
      .where('userId', '==', userId)
      .get();
      
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
  
  async createCategory(userId, categoryData) {
    const categoryRef = await this.db
      .collection('categories')
      .add({
        ...categoryData,
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
    return { id: categoryRef.id, ...categoryData };
  }

  async updateCategory(categoryId, userId, categoryData) {
    const categoryRef = this.db.collection('categories').doc(categoryId);
    const doc = await categoryRef.get();

    if (!doc.exists || doc.data().userId !== userId) {
      throw new AppError('Category not found or unauthorized', 404);
    }

    await categoryRef.update({
      ...categoryData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { id: categoryId, ...doc.data(), ...categoryData };
  }

  async deleteCategory(categoryId, userId) {
    const categoryRef = this.db.collection('categories').doc(categoryId);
    const doc = await categoryRef.get();

    if (!doc.exists || doc.data().userId !== userId) {
      throw new AppError('Category not found or unauthorized', 404);
    }

    await categoryRef.delete();
    return { id: categoryId, message: 'Category deleted successfully' };
  }
}

module.exports = CategoryService; // Assuming it needs to be exported
