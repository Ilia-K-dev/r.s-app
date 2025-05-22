import React from 'react';
import { useInventory } from '../../../features/inventory/hooks/useInventory';
import { Alert } from '../../../shared/components/ui/Alert';
import { Card } from '../../../shared/components/ui/Card';
import { Table } from '../../../shared/components/ui/Table';
import { Button } from '../../../shared/components/forms/Button'; // Import Button for pagination

const InventoryList = () => {
  const { inventory, loading, error, pagination, setPagination } = useInventory(); // Get pagination state and setter

  const columns = [
    { header: 'Item', key: 'name' },
    { header: 'Quantity', key: 'quantity' },
    { header: 'Unit', key: 'unit' },
    {
      header: 'Status',
      key: 'status',
      render: item => (
        <span
          className={`px-2 py-1 rounded-full text-sm ${
            item.quantity <= item.minStock
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {item.quantity <= item.minStock ? 'Low Stock' : 'In Stock'}
        </span>
      ),
    },
  ];

  // Handle pagination
  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      // Pass the lastVisible cursor to fetch the next page
      setPagination(prev => ({ ...prev, startAfter: pagination.lastVisible }));
    }
  };

  const handlePreviousPage = () => {
      // Note: Implementing "Previous" page with cursor-based pagination requires storing
      // the startAfter cursor for each page visited. This is a more complex state management
      // task and is beyond the basic implementation here. For simplicity, only "Next" is fully
      // supported with the current hook structure. A full implementation would involve
      // storing a history of lastVisible cursors.
      console.warn("Previous page not fully implemented with cursor-based pagination.");
      // A basic approach might involve refetching from the beginning with a limit and offset,
      // but this can be inefficient.
  };


  return (
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Inventory</h3>
        {error && <Alert type="error" message={error} className="mb-4" />}
        <Table columns={columns} data={inventory} loading={loading} />

        {/* Pagination Controls */}
        <div className="flex justify-center mt-4 space-x-4">
            {/* Previous button is complex with cursor pagination, omitting for basic implementation */}
            {/* <Button onClick={handlePreviousPage} disabled={!pagination.startAfter || loading}>Previous</Button> */}
            <Button onClick={handleNextPage} disabled={!pagination.hasNextPage || loading}>Next Page</Button>
        </div>
      </div>
    </Card>
  );
};

export default InventoryList;
