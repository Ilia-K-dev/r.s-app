import React from 'react';
import { format } from 'date-fns';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { formatCurrency } from '../../../shared/utils/currency';
import { Receipt, AlertTriangle, Calendar, DollarSign } from 'lucide-react';

export const ReceiptCard = ({ 
  receipt,
  onClick,
  isSelected = false,
  error = null,
  className = ''
}) => {
  if (!receipt) return null;

  const {
    merchant,
    date,
    total,
    category,
    status = 'processed',
    items = []
  } = receipt;

  const getStatusColor = (status) => {
    const colors = {
      processed: 'success',
      pending: 'warning',
      failed: 'error',
      reviewing: 'info'
    };
    return colors[status] || 'default';
  };

  return (
    <Card 
      className={`
        relative hover:shadow-md transition-shadow duration-200 cursor-pointer p-4
        ${isSelected ? 'ring-2 ring-primary-500' : ''}
        ${error ? 'border-red-300' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {error && (
        <div className="absolute top-2 right-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
      )}

      <div className="flex justify-between items-start space-x-4">
        <div className="flex items-start space-x-4">
          <div className="p-2 rounded-full bg-gray-100">
            <Receipt className="w-6 h-6 text-gray-600" />
          </div>

          <div>
            <h3 className="font-medium text-gray-900">{merchant}</h3>
            
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              {date ? format(new Date(date), 'MMM d, yyyy') : 'Unknown Date'}
            </div>
            
            {items.length > 0 && (
              <div className="mt-2 text-sm text-gray-500">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end">
            <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
            <span className="text-lg font-semibold text-gray-900">
              {formatCurrency(total || 0)}
            </span>
          </div>

          {status && (
            <Badge
              variant={getStatusColor(status)}
              size="sm"
              className="mt-2"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          )}

          {category && (
            <div className="mt-2">
              <Badge variant="default" size="sm">
                {category}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ReceiptCard;
