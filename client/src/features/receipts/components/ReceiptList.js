import React, { memo } from 'react'; // Import memo
import { ReceiptCard } from './ReceiptCard';
import { Loading } from '../../../shared/components/ui/Loading';
import { AlertCircle } from 'lucide-react';
import PerformanceOptimizedList from '../../../shared/components/ui/PerformanceOptimizedList'; // Import the optimized list

export const ReceiptList = memo(({ // Wrap the component with memo
  receipts = [],
  loading = false,
  error = null,
  onReceiptClick,
  selectedReceiptId = null,
  className = ''
}) => {

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-8 text-gray-500">
        <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
        <p className="text-lg font-medium">Failed to load receipts</p>
        <p className="text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-gray-500">
        <p className="text-lg font-medium">No receipts found</p>
        <p className="text-sm mt-2">Try adjusting your filters or upload a new receipt</p>
      </div>
    );
  }

  // Render the list using PerformanceOptimizedList
  return (
    <div className={className}>
      <PerformanceOptimizedList
        data={receipts}
        renderItem={(receipt, index) => (
          <ReceiptCard
            key={receipt.id} // Key is important for list items
            receipt={receipt}
            onClick={() => onReceiptClick?.(receipt)}
            isSelected={receipt.id === selectedReceiptId}
          />
        )}
        itemHeight={100} // Estimated height for a ReceiptCard
        overscanCount={5} // Render a few extra items above and below the visible area
      />
      {/* Pagination controls will be handled by the parent component */}
    </div>
  );
}); // Close memo wrapper

export default ReceiptList;
