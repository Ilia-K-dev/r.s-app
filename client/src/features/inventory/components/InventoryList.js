import React from 'react';//correct
import { Card } from '../../../shared/components/ui/Card';//correct
import { Table } from '../../../shared/components/ui/Table';//correct
import { useInventory } from '../../../features/inventory/hooks/useInventory';//correct
import { Alert } from 'lucide-react';//correct

const InventoryList = () => {
  const { inventory, loading, error } = useInventory();

  const columns = [
    { header: 'Item', key: 'name' },
    { header: 'Quantity', key: 'quantity' },
    { header: 'Unit', key: 'unit' },
    { header: 'Status', 
      key: 'status',
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-sm ${
          item.quantity <= item.minStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {item.quantity <= item.minStock ? 'Low Stock' : 'In Stock'}
        </span>
      )
    }
  ];

  return (
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Inventory</h3>
        {error && <Alert type="error" message={error} className="mb-4" />}
        <Table
          columns={columns}
          data={inventory}
          loading={loading}
        />
      </div>
    </Card>
  );
};