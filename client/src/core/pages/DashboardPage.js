import React, { useEffect, useState } from 'react';//correct
import { Card } from '../../shared/components/ui/Card';//correct
import { ReceiptList } from '../../features/receipts/components/ReceiptList';//correct
import { SpendingChart } from '../../features/analytics/components/SpendingChart';//correct
import { CategoryBreakdown } from '../../features/analytics/components/CategoryBreakdown';//correct
import { useReceipts } from '../../features/receipts/hooks/useReceipts';//correct
import { useCategories } from '../../features/categories/hooks/useCategories';//correct
import { Loading } from '../../shared/components/ui/Loading';//correct
import { Alert } from '../../shared/components/ui/Alert';//correct

export const DashboardPage = () => {
  const { receipts, loading: receiptsLoading, error: receiptsError } = useReceipts();
  const { categories, loading: categoriesLoading } = useCategories();
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    if (receipts) {
      const sortedReceipts = [...receipts].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      setRecentReceipts(sortedReceipts.slice(0, 5));
      
      const total = receipts.reduce((sum, receipt) => sum + receipt.total, 0);
      setTotalSpent(total);
    }
  }, [receipts]);

  if (receiptsLoading || categoriesLoading) {
    return <Loading size="lg" />;
  }

  if (receiptsError) {
    return <Alert type="error" message={receiptsError} />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Total Spent</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              ${totalSpent.toFixed(2)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Total Receipts</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {receipts.length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Categories</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {categories.length}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart data={receipts} />
        <CategoryBreakdown 
          receipts={receipts} 
          categories={categories} 
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Receipts</h2>
        <ReceiptList receipts={recentReceipts} />
      </div>
    </div>
  );
};