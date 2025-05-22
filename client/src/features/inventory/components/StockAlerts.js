import React from 'react';
import { Alert } from '../../../shared/components/ui/Alert';
import { useInventory } from '../hooks/useInventory';
import { Card } from '../../../shared/components/ui/Card';

const StockAlerts = () => {
  const { inventory, loading, error } = useInventory();

  if (loading) {
    return <div>Loading alerts...</div>;
  }

  if (error) {
    return <Alert type="error" message={`Error loading alerts: ${error}`} />;
  }

  // Filter items where quantity is at or below reorderPoint
  const lowStockItems = inventory.filter(item => item.quantity <= item.reorderPoint);

  if (lowStockItems.length === 0) {
    return null; // Don't render if no alerts
  }

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4 text-yellow-700">Low Stock Alerts</h2>
      <div className="space-y-3">
        {lowStockItems.map(item => (
          <Alert key={item.id} type="warning" message={`${item.name} is running low. Current stock: ${item.quantity}`} />
        ))}
      </div>
    </Card>
  );
};

export default StockAlerts;
