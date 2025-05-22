import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
} from 'firebase/firestore'; //correct

import { db } from '../../../core/config/firebase'; //correct

export const categoriesApi = {
  getCategories: async userId => {
    try {
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error('Failed to fetch categories');
    }
  },

  addCategory: async (userId, categoryData) => {
    try {
      const categoriesRef = collection(db, 'categories');
      const newCategory = {
        ...categoryData,
        userId,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(categoriesRef, newCategory);
      return {
        id: docRef.id,
        ...newCategory,
      };
    } catch (error) {
      throw new Error('Failed to create category');
    }
  },

  updateCategory: async (categoryId, categoryData) => {
    try {
      const categoryRef = doc(db, 'categories', categoryId);
      await updateDoc(categoryRef, {
        ...categoryData,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      throw new Error('Failed to update category');
    }
  },

  deleteCategory: async categoryId => {
    try {
      const categoryRef = doc(db, 'categories', categoryId);
      await deleteDoc(categoryRef);
    } catch (error) {
      throw new Error('Failed to delete category');
    }
  },
};
