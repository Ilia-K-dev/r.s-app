import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../shared/components/ui/Card';
import { ReceiptList } from '../../../features/receipts/components/ReceiptList';
import { Button } from '../../../shared/components/ui/Button';
import { useReceipts } from '../../../features/receipts/hooks/useReceipts';
import { SpendingChart } from '../../analytics/components/SpendingChart';
import { formatCurrency } from '../../../shared/utils/currency';
import { Loading } from '../../../shared/components/ui/Loading';
import { Alert } from '../../../shared/components/ui/Alert';
import { PieChart, CreditCard, ShoppingBag, Plus } from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { receipts, loading: receiptsLoading, error: receiptsError } = useReceipts();
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [stats, setStats] = useState({
    totalSpent: 0,
    receiptCount: 0,
    categoryCount: 0
  });

  useEffect(() => {
    if (receipts && receipts.length > 0) {
      // Get recent receipts (last 5)
      const sorted = [...receipts].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      setRecentReceipts(sorted.slice(0, 5));
      
      // Calculate summary stats
      const total = receipts.reduce((sum, receipt) => sum + receipt.total, 0);
      
      // Get unique categories
      const categories = new Set(receipts.map(receipt => receipt.category).filter(Boolean));
      
      setStats({
        totalSpent: total,
        receiptCount: receipts.length,
        categoryCount: categories.size
      });
    }
  }, [receipts]);

  const handleReceiptClick = (receipt) => {
    navigate(`/receipts/${receipt.id}`);
  };

  const handleAddReceiptClick = () => {
    navigate('/receipts');
  };

  if (receiptsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  if (receiptsError) {
    return (
      <Alert type="error" message={receiptsError} />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 mr-4">
              <CreditCard className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(stats.totalSpent)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <ShoppingBag className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Receipts</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {stats.receiptCount}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <PieChart className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Categories</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {stats.categoryCount}
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Spending Chart */}
      {receipts.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Spending Overview</h2>
          <div className="h-64">
            <SpendingChart data={receipts} />
          </div>
        </Card>
      )}
      
      {/* Recent Receipts */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Receipts</h2>
          <Button 
            variant="primary" 
            icon={Plus}
            onClick={handleAddReceiptClick}
          >
            Add Receipt
          </Button>
        </div>
        
        {recentReceipts.length > 0 ? (
          <ReceiptList
            receipts={recentReceipts}
            onReceiptClick={handleReceiptClick}
          />
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">No receipts found. Start by adding your first receipt.</p>
            <Button 
              variant="primary" 
              icon={Plus}
              onClick={handleAddReceiptClick}
            >
              Add Receipt
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
