// src/features/documents/components/ReceiptPreview.js

import React, { useState } from 'react';//correct
import { Card } from '../../../shared/components/ui/Card';//correct
import { Button } from '../../../shared/components/forms/Button';//correct
import { Alert } from '../../../shared/components/ui/Alert';//correct
import { Loading } from '../../../shared/components/ui/Loading';//correct
import { 
  Download, 
  Maximize, 
  Minimize, 
  RotateCw, 
  Edit, 
  Trash,
  Printer
} from 'lucide-react';//correct
import { formatCurrency } from '../../../shared/utils/currency';
import { formatDate } from '../../../shared/utils/date';

export const ReceiptPreview = ({
  receipt,
  imageUrl,
  onEdit,
  onDelete,
  onDownload,
  onPrint,
  loading = false,
  error = null,
  className = ''
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);

  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleFullscreen = () => setIsFullscreen(!isFullscreen);

  if (loading) {
    return (
      <Card className={`flex items-center justify-center p-8 ${className}`}>
        <Loading size="lg" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-4 ${className}`}>
        <Alert type="error" message={error} />
      </Card>
    );
  }

  const ImageActions = () => (
    <div className="absolute top-2 right-2 flex space-x-2">
      <Button
        variant="secondary"
        size="sm"
        icon={isFullscreen ? Minimize : Maximize}
        onClick={handleFullscreen}
      />
      <Button
        variant="secondary"
        size="sm"
        icon={RotateCw}
        onClick={handleRotate}
      />
      {onDownload && (
        <Button
          variant="secondary"
          size="sm"
          icon={Download}
          onClick={onDownload}
        />
      )}
      {onPrint && (
        <Button
          variant="secondary"
          size="sm"
          icon={Printer}
          onClick={onPrint}
        />
      )}
    </div>
  );

  const ReceiptDetails = () => (
    <div className="p-4 border-t">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{receipt.merchant}</h3>
          <p className="text-sm text-gray-500">
            {formatDate(receipt.date)}
          </p>
          {receipt.category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-1">
              {receipt.category}
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(receipt.total)}
          </p>
          {receipt.items?.length > 0 && (
            <p className="text-sm text-gray-500">
              {receipt.items.length} items
            </p>
          )}
        </div>
      </div>

      {receipt.items?.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Items</h4>
          <div className="space-y-1">
            {receipt.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between text-sm"
              >
                <div className="flex-1">
                  <span className="text-gray-700">{item.name}</span>
                  {item.quantity > 1 && (
                    <span className="text-gray-500 ml-2">
                      x{item.quantity}
                    </span>
                  )}
                </div>
                <span className="text-gray-900 font-medium ml-4">
                  {formatCurrency(item.price * (item.quantity || 1))}
                </span>
              </div>
            ))}
          </div>

          {/* Tax and Total */}
          {(receipt.tax || receipt.total) && (
            <div className="mt-4 pt-4 border-t">
              {receipt.tax && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="text-gray-900">{formatCurrency(receipt.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-medium mt-2">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{formatCurrency(receipt.total)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Receipt Actions */}
      {(onEdit || onDelete) && (
        <div className="mt-4 flex justify-end space-x-2">
          {onEdit && (
            <Button
              variant="secondary"
              size="sm"
              icon={Edit}
              onClick={onEdit}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              icon={Trash}
              onClick={onDelete}
            >
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="relative">
        {imageUrl ? (
          <div className={`
            relative 
            ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'h-96'}
          `}>
            <img
              src={imageUrl}
              alt={`Receipt from ${receipt.merchant}`}
              className={`
                w-full h-full object-contain
                transition-transform duration-200
                ${isFullscreen ? 'cursor-zoom-out' : 'cursor-zoom-in'}
              `}
              style={{ transform: `rotate(${rotation}deg)` }}
              onClick={handleFullscreen}
            />
            <ImageActions />
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">No image available</p>
          </div>
        )}
      </div>
      <ReceiptDetails />
    </Card>
  );
};

export default ReceiptPreview;