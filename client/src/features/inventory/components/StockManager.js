import React, { useState } from 'react';//correct
import { Card } from '../../../shared/components/ui/Card';//correct
import { Input } from '../../../shared/components/forms/Input';//correct
import { Button } from '../../../shared/components/forms/Button';//correct
import { Alert } from '../../../shared/components/ui/Alert';//correct
import { useInventory } from '../../../features/inventory/hooks/useInventory';//correct
import { Plus, Save } from 'lucide-react';//correct

const StockManager = () => {
  const { addItem, updateStock } = useInventory();
  const [newItem, setNewItem] = useState({ name: '', quantity: '', unit: '', minStock: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addItem(newItem);
      setNewItem({ name: '', quantity: '', unit: '', minStock: '' });
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Stock Manager</h3>
        {error && <Alert type="error" message={error} className="mb-4" />}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Item Name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity"
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              required
            />
            <Input
              label="Unit"
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              required
            />
          </div>
          <Input
            label="Minimum Stock Level"
            type="number"
            value={newItem.minStock}
            onChange={(e) => setNewItem({ ...newItem, minStock: e.target.value })}
            required
          />
          <Button type="submit" icon={Plus}>Add Item</Button>
        </form>
      </div>
    </Card>
  );
};
