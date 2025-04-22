import React from 'react'//correct
import { useInventory } from '../hooks/useInventory';//correct
import { Alert } from '../../../shared/components/ui/Alert';//correct

const StockAlerts = () => {
  const { inventory, loading, error } = useInventory();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const lowStockItems = inventory.filter(item => item.quantity <= item.reorderPoint);

  if (lowStockItems.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Low Stock Alerts</h2>
      {lowStockItems.map(item => (
        <Alert key={item.id} type="warning">
          {item.name} is running low. Current stock: {item.quantity}
        </Alert>
      ))}
    </div>
  );
};

export default StockAlerts;