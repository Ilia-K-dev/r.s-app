import { Store, Calendar, DollarSign, Tag, Plus, Trash, Save } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Input } from '../../..//shared/components/forms/Input';
import Button from '../../../shared/components/ui/Button';
import { Dropdown } from '../../../shared/components/forms/Dropdown';
import { Alert } from '../../../shared/components/ui/Alert';
import { Modal } from '../../../shared/components/ui/Modal';
import { useToast } from '../../../shared/hooks/useToast';
import { parseCurrencyInput, formatCurrency } from '../../../shared/utils/currency';
import { useCategories } from '../../categories/hooks/useCategories';
import { validateAmount, validateRequired } from '../utils/validation';

const ReceiptForm = ({ initialData = null, onSubmit, onCancel, loading = false, addReceipt }) => {
  const { categories, loading: categoriesLoading } = useCategories();
  const { showToast } = useToast();
  const [errors, setErrors] = useState({});
  const [showTotalMismatchModal, setShowTotalMismatchModal] = useState(false);

  const [formData, setFormData] = useState({
    merchant: '',
    date: new Date().toISOString().split('T')[0],
    total: '',
    category: '',
    items: [{ name: '', price: '', quantity: 1 }],
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: new Date(initialData.date).toISOString().split('T')[0],
        items:
          initialData.items?.length > 0
            ? initialData.items
            : [{ name: '', price: '', quantity: 1 }],
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};

    // Validate required fields
    const requiredFields = ['merchant', 'date', 'total', 'category'];
    requiredFields.forEach(field => {
      const validation = validateRequired(formData[field], field);
      if (!validation.isValid) {
        newErrors[field] = validation.error;
      }
    });

    // Validate amount
    const amountValidation = validateAmount(formData.total);
    if (!amountValidation.isValid) {
      newErrors.total = amountValidation.error;
    }

    // Validate items
    const itemsWithValues = formData.items.filter(item => item.name.trim() || item.price);

    itemsWithValues.forEach((item, index) => {
      if (!item.name.trim()) {
        newErrors[`items.${index}.name`] = 'Item name is required';
      }
      if (!validateAmount(item.price).isValid) {
        newErrors[`items.${index}.price`] = 'Valid price is required';
      }
      if (item.quantity < 1) {
        newErrors[`items.${index}.quantity`] = 'Quantity must be at least 1';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (proceedWithMismatch = false) => {
    // Clear any previous total mismatch modal
    setShowTotalMismatchModal(false);

    if (!validateForm()) {
      showToast('Please fix the errors before submitting', 'error');
      return;
    }

    try {
      // Calculate total from items if they exist
      const itemsTotal = formData.items.reduce(
        (sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1),
        0
      );

      // Validate total matches items if items exist
      if (formData.items.length > 0 && Math.abs(itemsTotal - parseFloat(formData.total)) > 0.01) {
        if (!proceedWithMismatch) {
          setShowTotalMismatchModal(true);
          return;
        }
      }

      await addReceipt(formData);
      showToast('Receipt saved successfully', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to save receipt', 'error');
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'price' ? parseCurrencyInput(value) : value,
    };

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
    }));

    // Clear error for this field if it exists
    if (errors[`items.${index}.${field}`]) {
      const { [`items.${index}.${field}`]: _, ...restErrors } = errors;
      setErrors(restErrors);
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', price: '', quantity: 1 }],
    }));
  };

  const removeItem = index => {
    if (formData.items.length === 1) {
      showToast('Cannot remove the last item', 'warning');
      return;
    }

    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  return (
    <>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-6"
      >
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Merchant"
            icon={Store}
            value={formData.merchant}
            onChange={e => {
              setFormData(prev => ({ ...prev, merchant: e.target.value }));
              if (errors.merchant) {
                const { merchant, ...rest } = errors;
                setErrors(rest);
              }
            }}
            error={errors.merchant}
            required
          />

          <Input
            type="date"
            label="Date"
            icon={Calendar}
            value={formData.date}
            onChange={e => {
              setFormData(prev => ({ ...prev, date: e.target.value }));
              if (errors.date) {
                const { date, ...rest } = errors;
                setErrors(rest);
              }
            }}
            error={errors.date}
            required
          />

          <Input
            type="text"
            label="Total Amount"
            icon={DollarSign}
            value={formData.total}
            onChange={e => {
              const value = parseCurrencyInput(e.target.value);
              setFormData(prev => ({ ...prev, total: value }));
              if (errors.total) {
                const { total, ...rest } = errors;
                setErrors(rest);
              }
            }}
            placeholder="0.00"
            error={errors.total}
            required
          />

          <Dropdown
            label="Category"
            icon={Tag}
            options={categories.map(cat => ({
              value: cat.id,
              label: cat.name,
            }))}
            value={formData.category}
            onChange={value => {
              setFormData(prev => ({ ...prev, category: value }));
              if (errors.category) {
                const { category, ...rest } = errors;
                setErrors(rest);
              }
            }}
            error={errors.category}
            disabled={categoriesLoading}
            required
          />
        </div>

        {/* Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Items</h3>
            <Button type="button" variant="secondary" size="sm" onClick={addItem} icon={Plus}>
              Add Item
            </Button>
          </div>

          {formData.items.map((item, index) => (
            <div key={index} className="flex gap-4 items-start">
              <Input
                placeholder="Item name"
                value={item.name}
                onChange={e => handleItemChange(index, 'name', e.target.value)}
                error={errors[`items.${index}.name`]}
                className="flex-1"
              />
              <Input
                type="text"
                placeholder="Price"
                value={item.price}
                onChange={e => handleItemChange(index, 'price', e.target.value)}
                error={errors[`items.${index}.price`]}
                className="w-32"
                prefix="$"
              />
              <Input
                type="number"
                placeholder="Qty"
                value={item.quantity}
                onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                error={errors[`items.${index}.quantity`]}
                min="1"
                className="w-24"
              />
              {formData.items.length > 1 && (
                <Button
                  type="button"
                  variant="danger"
                  size="icon"
                  onClick={() => removeItem(index)}
                  icon={Trash}
                />
              )}
            </div>
          ))}
        </div>

        {/* Notes */}
        <Input
          label="Notes"
          type="textarea"
          value={formData.notes}
          onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Add any additional notes here..."
          className="h-24"
        />

        {/* Error Summary (Client-side Validation Errors) */}
        {Object.keys(errors).length > 0 && (
          <Alert
            type="error"
            title="Please fix the following errors:"
            message={
              <ul className="list-disc list-inside">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            }
            className="mb-4"
          />
        )}

        {/* Server/Hook Error Display */}
        {error && (
           <Alert
             type="error"
             title="Error saving receipt:"
             message={error}
             className="mb-4"
           />
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} icon={Save}>
            {initialData ? 'Update Receipt' : 'Save Receipt'}
          </Button>
        </div>
      </form>

      {/* Total Mismatch Modal */}
      {showTotalMismatchModal && (
        <Modal
          isOpen={showTotalMismatchModal}
          onClose={() => setShowTotalMismatchModal(false)}
          title="Total Amount Mismatch"
        >
          <div className="p-4">
            <p>The total amount doesn't match the sum of item prices. Do you want to proceed?</p>
            <div className="flex justify-end space-x-4 mt-4">
              <Button variant="secondary" onClick={() => setShowTotalMismatchModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleSubmit(true)}>Proceed Anyway</Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ReceiptForm;
