import React from 'react';//correct
import { Card } from '../../../shared/components/ui/Card'; //correct
import { formatCurrency } from '../../../shared/utils/currency'; //correct
import { formatDate } from '../../../shared/utils/date';//correct
import { Download, Printer } from 'lucide-react';//correct
import { Button } from '../../../shared/components/forms/Button';//correct

const ReceiptDetail = ({ 
  receipt,
  onDownload,
  onPrint,
  className = ''
}) => {
  const TotalSection = () => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-500">
        <span>Subtotal</span>
        <span>{formatCurrency(receipt.subtotal)}</span>
      </div>
      {receipt.tax > 0 && (
        <div className="flex justify-between text-sm text-gray-500">
          <span>Tax</span>
          <span>{formatCurrency(receipt.tax)}</span>
        </div>
      )}
      {receipt.discount > 0 && (
        <div className="flex justify-between text-sm text-gray-500">
          <span>Discount</span>
          <span>-{formatCurrency(receipt.discount)}</span>
        </div>
      )}
      <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t">
        <span>Total</span>
        <span>{formatCurrency(receipt.total)}</span>
      </div>
    </div>
  );

  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header with Actions */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {receipt.merchant}
            </h3>
            <p className="text-sm text-gray-500">
              {formatDate(receipt.date)}
            </p>
            {receipt.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                {receipt.category}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            {onPrint && (
              <Button
                variant="secondary"
                size="sm"
                icon={Printer}
                onClick={onPrint}
              >
                Print
              </Button>
            )}
            {onDownload && (
              <Button
                variant="secondary"
                size="sm"
                icon={Download}
                onClick={onDownload}
              >
                Download
              </Button>
            )}
          </div>
        </div>

        {/* Items Section */}
        {receipt.items && receipt.items.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Items</h4>
            <div className="divide-y">
              {receipt.items.map((item, index) => (
                <div key={index} className="py-3 flex justify-between">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      {item.name}
                    </span>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {item.description}
                      </p>
                    )}
                    {item.quantity > 1 && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        Quantity: {item.quantity}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.price)}
                    </span>
                    {item.quantity > 1 && (
                      <p className="text-xs text-gray-500">
                        {formatCurrency(item.price / item.quantity)} each
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Totals Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <TotalSection />
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-2 gap-6">
          {receipt.paymentMethod && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </h4>
              <p className="text-sm text-gray-900">
                {receipt.paymentMethod}
              </p>
            </div>
          )}
          {receipt.transactionId && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                Transaction ID
              </h4>
              <p className="text-sm text-gray-900">
                {receipt.transactionId}
              </p>
            </div>
          )}
        </div>

        {/* Notes Section */}
        {receipt.notes && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Notes
            </h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap rounded-lg bg-gray-50 p-3">
              {receipt.notes}
            </p>
          </div>
        )}

        {/* Receipt Image */}
        {receipt.imageUrl && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Receipt Image
            </h4>
            <div className="rounded-lg overflow-hidden border">
              <img
                src={receipt.imageUrl}
                alt="Receipt"
                className="w-full h-auto"
              />
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Added on {formatDate(receipt.createdAt)}</span>
            {receipt.updatedAt && (
              <span>Last updated {formatDate(receipt.updatedAt)}</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReceiptDetail;