import React from 'react';//correct
import { format } from 'date-fns';//correct
import { Card } from '../../../shared/components/ui/Card'; //correct
import { Badge } from '../../../shared/components/ui/Badge';//correct
import { Tooltip } from '../../../shared/components/ui/Tooltip';//correct
import { formatCurrency } from '../../../shared/utils/currency'; //correct
import { Receipt, AlertTriangle, Calendar, DollarSign } from 'lucide-react';//correct

const ReceiptCard = ({ 
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
        relative hover:shadow-md transition-shadow duration-200
        ${isSelected ? 'ring-2 ring-primary-500' : ''}
        ${error ? 'border-red-300' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {error && (
        <Tooltip content={error} position="top">
          <div className="absolute top-2 right-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
        </Tooltip>
      )}

      <div className="flex justify-between items-start p-4">
        <div className="flex items-start space-x-4">
          <div className={`
            p-2 rounded-full bg-${getStatusColor(status)}-100
          `}>
            <Receipt className={`w-6 h-6 text-${getStatusColor(status)}-600`} />
          </div>

          <div>
            <h3 className="font-medium text-gray-900">{merchant}</h3>
            
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              {format(new Date(date), 'MMM d, yyyy')}
            </div>
            
            {items.length > 0 && (
              <div className="mt-2">
                <Tooltip 
                  content={
                    <ul className="space-y-1">
                      {items.map((item, index) => (
                        <li key={index}>
                          {item.name}: {formatCurrency(item.price)}
                        </li>
                      ))}
                    </ul>
                  }
                >
                  <span className="text-sm text-gray-500">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </Tooltip>
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end">
            <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
            <span className="text-lg font-semibold text-gray-900">
              {formatCurrency(total)}
            </span>
          </div>

          <Badge
            variant={getStatusColor(status)}
            size="sm"
            className="mt-2"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>

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

export default React.memo(ReceiptCard);
