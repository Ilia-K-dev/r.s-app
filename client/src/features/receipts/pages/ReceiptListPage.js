import React from 'react';
// Modified useReceipts import as part of build error fix task on 2025-05-08
import { useReceipts } from '../hooks/useReceipts';
import ReceiptList from '../components/ReceiptList';
import ReceiptFilters from '../components/ReceiptFilters';
import { Button } from '../../../shared/components/ui/Button';
import Loading from '../../../shared/components/ui/Loading';
import { Alert } from '../../../shared/components/ui/Alert';
import { useNavigate } from 'react-router-dom';

const ReceiptListPage = () => {
  const { receipts, loading, error, pagination, setPagination, filters, setFilters } = useReceipts();

  const navigate = useNavigate();

  const handleNewReceiptClick = () => {
    navigate('/upload-receipt');
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
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
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, startAfter: null })); // Reset pagination on filter change
  };


  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Receipts</h1>
        <Alert type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Receipts</h1>

      <div className="flex justify-between items-center mb-4">
        <ReceiptFilters currentFilters={filters} onFilterChange={handleFilterChange} />
        <Button onClick={handleNewReceiptClick}>New Receipt</Button>
      </div>

      {receipts && receipts.length > 0 ? (
        <>
          <ReceiptList receipts={receipts} />

          {/* Pagination Controls */}
          <div className="flex justify-center mt-4 space-x-4">
            {/* Previous button is complex with cursor pagination, omitting for basic implementation */}
            {/* <Button onClick={handlePreviousPage} disabled={!pagination.startAfter || loading}>Previous</Button> */}
            <Button onClick={handleNextPage} disabled={!pagination.hasNextPage || loading}>Next Page</Button>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500">No receipts found.</div>
      )}
    </div>
  );
};

export default ReceiptListPage;
