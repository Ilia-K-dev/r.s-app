import { useState, useEffect } from 'react';//correct
import { useAuth } from '../../../features/auth/hooks/useAuth';//correct
import { categoriesApi } from '../../../features/categories/services/categories';//correct

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getCategories(user.uid);
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (categoryData) => {
    try {
      const newCategory = await categoriesApi.addCategory(user.uid, categoryData);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      throw new Error('Failed to add category');
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      await categoriesApi.updateCategory(id, categoryData);
      setCategories(prev =>
        prev.map(cat => cat.id === id ? { ...cat, ...categoryData } : cat)
      );
    } catch (err) {
      throw new Error('Failed to update category');
    }
  };

  const deleteCategory = async (id) => {
    try {
      await categoriesApi.deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      throw new Error('Failed to delete category');
    }
  };

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory
  };
};