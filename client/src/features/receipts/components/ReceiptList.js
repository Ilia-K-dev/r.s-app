import React, { useState, useMemo } from 'react';//correct
import { ReceiptCard } from '../components/ReceiptCard'; //correct
import { Button } from '../../../shared/components/forms/Button';//correct
import { Loading } from '../../../shared/components/ui/Loading'; //correct
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';//correct
import { formatDate } from '../../../shared/utils/date'; //correct
import { formatCurrency } from '../../../shared/utils/currency'; //correct

const ITEMS_PER_PAGE = 10;

const ReceiptList = ({
  receipts = [],
  loading = false,
  error = null,
  onReceiptClick,
  selectedReceiptId = null,
  className = ''
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedReceipts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return receipts.slice(startIndex, endIndex);
  }, [receipts, currentPage]);

  const totalPages = Math.ceil(receipts.length / ITEMS_PER_PAGE);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
    // Scroll to top of list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        <Receipt className="w-12 h-12 mb-4" />
        <p className="text-lg font-medium">No receipts found</p>
        <p className="text-sm mt-2">Try adjusting your filters or upload a new receipt</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Receipts Grid */}
      <div className="grid gap-4 mb-6">
        {paginatedReceipts.map((receipt) => (
          <ReceiptCard
            key={receipt.id}
            receipt={receipt}
            onClick={() => onReceiptClick?.(receipt)}
            isSelected={receipt.id === selectedReceiptId}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, receipts.length)} of{' '}
            {receipts.length} receipts
          </div>

          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              icon={ChevronLeft}
            >
              Previous
            </Button>

            {/* Page Numbers */}
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(pageNum => {
                  // Show first page, last page, current page, and pages around current
                  return (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - currentPage) <= 1
                  );
                })
                .map((pageNum, index, array) => {
                  // Add ellipsis
                  if (index > 0 && pageNum - array[index - 1] > 1) {
                    return (
                      <React.Fragment key={`ellipsis-${pageNum}`}>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled
                          className="px-2"
                        >
                          ...
                        </Button>
                        <Button
                          variant={pageNum === currentPage ? "primary" : "secondary"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="px-4"
                        >
                          {pageNum}
                        </Button>
                      </React.Fragment>
                    );
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="px-4"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              icon={ChevronRight}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptList;
