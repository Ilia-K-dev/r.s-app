import React, { useState } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/forms/Input';
import { Button } from '../../../shared/components/forms/Button';
import { Alert } from '../../../shared/components/ui/Alert';
import { useCategories } from '../../categories/hooks/useCategories';
import { useToast } from '../../../shared/hooks/useToast';
import { Tag, Plus, Trash, Edit, Save, X } from 'lucide-react';

export const CategorySettings = () => {
  const { categories, loading, error, addCategory, updateCategory, deleteCategory } = useCategories();
  const { showToast } = useToast();
  
  const [newCategory, setNewCategory] = useState({ name: '', color: '#3B82F6' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [validationError, setValidationError] = useState(null);
  
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);
    
    if (!newCategory.name.trim()) {
      setValidationError('Category name is required');
      return;
    }
    
    try {
      await addCategory(newCategory);
      setNewCategory({ name: '', color: '#3B82F6' });
      showToast('Category added successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);
    
    if (!editingCategory.name.trim()) {
      setValidationError('Category name is required');
      return;
    }
    
    try {
      await updateCategory(editingCategory.id, {
        name: editingCategory.name,
        color: editingCategory.color
      });
      
      setEditingCategory(null);
      showToast('Category updated successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
  
  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(categoryId);
        showToast('Category deleted successfully', 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Category Settings</h2>
      
      {error && (
        <Alert 
          type="error" 
          message={error} 
          className="mb-4" 
        />
      )}
      
      {validationError && (
        <Alert 
          type="error" 
          message={validationError} 
          className="mb-4" 
        />
      )}
      
      {/* Add New Category Form */}
      <form onSubmit={handleAddSubmit} className="mb-6">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Input
              label="New Category Name"
              icon={Tag}
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              placeholder="Enter category name"
            />
          </div>
          
          <div className="w-24">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <input
              type="color"
              value={newCategory.color}
              onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
              className="w-full h-10 p-1 border border-gray-300 rounded-lg"
            />
          </div>
          
          <Button
            type="submit"
            loading={loading}
            icon={Plus}
          >
            Add
          </Button>
        </div>
      </form>
      
      {/* Categories List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Your Categories</h3>
        
        {categories.length === 0 ? (
          <p className="text-gray-500">No custom categories yet. Add your first category above.</p>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                {editingCategory && editingCategory.id === category.id ? (
                  <form onSubmit={handleEditSubmit} className="flex w-full items-center gap-4">
                    <div className="flex-1">
                      <Input
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ 
                          ...editingCategory, 
                          name: e.target.value 
                        })}
                      />
                    </div>
                    
                    <div className="w-20">
                      <input
                        type="color"
                        value={editingCategory.color}
                        onChange={(e) => setEditingCategory({ 
                          ...editingCategory, 
                          color: e.target.value 
                        })}
                        className="w-full h-8 p-1 border border-gray-300 rounded-lg"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      variant="success"
                      size="sm"
                      icon={Save}
                    >
                      Save
                    </Button>
                    
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      icon={X}
                      onClick={() => setEditingCategory(null)}
                    >
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center">
                      <div 
                        className="w-5 h-5 rounded-full mr-3" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit}
                        onClick={() => setEditingCategory(category)}
                      >
                        Edit
                      </Button>
                      
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash}
                        onClick={() => handleDelete(category.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default CategorySettings;
