import React, { useState, useEffect } from 'react';//correct
import { Card } from '../../../shared/components/ui/Card'; //correct
import { Input } from '../../..//shared/components/forms/Input';//correct
import { Button } from '../../../shared/components/forms/Button';//correct
import { Alert } from '../../../shared/components/ui/Alert';//correct
import { Dropdown } from '../../../shared/components/forms/Dropdown';//correct
import { DateRangePicker } from '../../../shared/components/ui/DateRangePicker';//correct
import { useCategories } from '../../categories/hooks/useCategories';//correct
import { validateReceipt } from '../utils/validation';//correct
import { parseCurrencyInput, formatCurrency } from '../../../shared/utils/currency';//correct
import { Store, Calendar, DollarSign, Tag, Plus, Trash, Receipt, Save } from 'lucide-react';//correct

const ReceiptEdit = ({
  receipt,
  onSave,
  onCancel,
  loading = false,
  error = null
}) => {
  const { categories, loading: categoriesLoading } = useCategories();
  
  const [formData, setFormData] = useState({
    merchant: '',
    date: new Date().toISOString().split('T')[0],
    total: '',
    category: '',
    items: [{ name: '', price: '', quantity: 1 }],
    notes: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (receipt) {
      setFormData({
        merchant: receipt.merchant || '',
        date: receipt.date ? new Date(receipt.date).toISOString().split('T')[0] : '',
        total: receipt.total ? receipt.total.toString() : '',
        category: receipt.category || '',
        items: receipt.items?.length > 0 
          ? receipt.items 
          : [{ name: '', price: '', quantity: 1 }],
        notes: receipt.notes || ''
      });
    }
  }, [receipt]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'price' ? parseCurrencyInput(value) : value
    };

    // Recalculate total
    const newTotal = updatedItems.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0);

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      total: newTotal.toFixed(2)
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', price: '', quantity: 1 }]
    }));
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateReceipt(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    // Clear validation errors
    setValidationErrors({});

    // Call onSave with formatted data
    const submissionData = {
      ...formData,
      total: parseFloat(formData.total),
      items: formData.items.map(item => ({
        ...item,
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity)
      }))
    };

    await onSave(submissionData);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert type="error" message={error} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Merchant"
            icon={Store}
            value={formData.merchant}
            onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
            error={validationErrors.merchant}
            required
          />

          <Input
            type="date"
            label="Date"
            icon={Calendar}
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            error={validationErrors.date}
            required
          />

          <Input
            type="text"
            label="Total Amount"
            icon={DollarSign}
            value={formData.total}
            onChange={(e) => setFormData({ 
              ...formData, 
              total: parseCurrencyInput(e.target.value)
            })}
            error={validationErrors.total}
            required
          />

          <Dropdown
            label="Category"
            icon={Tag}
            options={categories.map(cat => ({
              value: cat.id,
              label: cat.name
            }))}
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value })}
            error={validationErrors.category}
            disabled={categoriesLoading}
            required
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Items</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={addItem}
            >
              Add Item
            </Button>
          </div>

          {formData.items.map((item, index) => (
            <div key={index} className="flex gap-4">
              <Input
                placeholder="Item name"
                value={item.name}
                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                error={validationErrors.items?.[index]?.name}
                className="flex-1"
              />
              <Input
                type="text"
                placeholder="Price"
                value={item.price}
                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                error={validationErrors.items?.[index]?.price}
                className="w-32"
                prefix="$"
              />
              <Input
                type="number"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                error={validationErrors.items?.[index]?.quantity}
                min="1"
                className="w-24"
              />
              {formData.items.length > 1 && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  icon={Trash}
                  onClick={() => removeItem(index)}
                />
              )}
            </div>
          ))}
        </div>

        <Input
          label="Notes"
          type="textarea"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="h-24"
          placeholder="Add any additional notes here..."
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            icon={Save}
          >
            Save Receipt
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ReceiptEdit;