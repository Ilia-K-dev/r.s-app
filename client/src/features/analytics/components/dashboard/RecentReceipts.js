import { Plus, ChevronRight } from 'lucide-react'; //correct
import React from 'react'; //correct
import { Link } from 'react-router-dom'; //correct

import ReceiptCard from '../../../../features/receipts/components/ReceiptCard'; //correct
import { Button } from '../../../../shared/components/forms/Button'; //correct
import { Card } from '../../../../shared/components/ui/Card'; //correct


export const RecentReceipts = ({ receipts = [], loading = false, onAddReceipt }) => (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Recent Receipts</h3>
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm" icon={Plus} onClick={onAddReceipt}>
              Add Receipt
            </Button>
            <Link to="/receipts">
              <Button variant="primary" size="sm" icon={ChevronRight}>
                View All
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center space-x-4 py-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          ) : receipts.length > 0 ? (
            receipts.slice(0, 5).map(receipt => <ReceiptCard key={receipt.id} receipt={receipt} />)
          ) : (
            <div className="p-8 text-center">
              <ReceiptCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No receipts</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first receipt</p>
              <div className="mt-6">
                <Button onClick={onAddReceipt} icon={Plus}>
                  Add Receipt
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
