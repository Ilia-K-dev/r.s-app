import { Plus } from 'lucide-react'; //correct
import React, { useState, useEffect } from 'react'; //correct

import { ReceiptFilters } from '../../features/receipts/components//ReceiptFilters'; //correct
import ReceiptForm from '../../features/receipts/components/ReceiptForm'; //correct
import ReceiptList from '../../features/receipts/components/ReceiptList'; //correct
import { ReceiptUploader } from '../../features/receipts/components/ReceiptUploader';
import { useReceipts } from '../../features/receipts/hooks/useReceipts'; //correct
import { Button } from '../../shared/components/forms/Button'; //correct
import { Modal } from '../../shared/components/ui/Modal'; //correct
import { useToast } from '../../shared/hooks/useToast';

export const ReceiptsPage = () => {
  const { receipts, loading, error, fetchReceipts } = useReceipts();
  const { showToast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    dateRange: '',
    category: '',
    sortBy: 'date_desc',
  });

  const handleFilterChange = newFilters => {
    setFilters(newFilters);
    fetchReceipts(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      dateRange: '',
      category: '',
      sortBy: 'date_desc',
    });
    fetchReceipts();
  };

  const handleUploadSuccess = () => {
    showToast('Receipt uploaded successfully', 'success');
    fetchReceipts(filters);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>
        <Button onClick={() => setIsFormOpen(true)} icon={Plus}>
          Add Receipt
        </Button>
      </div>

      <ReceiptUploader onUploadSuccess={handleUploadSuccess} />

      <ReceiptFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <ReceiptList receipts={receipts} loading={loading} error={error} />

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Add Receipt">
        <ReceiptForm
          addReceipt={useReceipts().addReceipt}
          onSubmit={async data => {
            try {
              showToast('Receipt added successfully', 'success');
              setIsFormOpen(false);
              fetchReceipts(filters);
            } catch (error) {
              showToast(error.message, 'error');
            }
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>
    </div>
  );
};
