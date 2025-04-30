import React, { useState } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/forms/Button';
import { Dropdown } from '../../../shared/components/forms/Dropdown';
import { Alert } from '../../../shared/components/ui/Alert';
import { Loading } from '../../../shared/components/ui/Loading';
import { SpendingChart } from '../components/SpendingChart';
import { CategoryBreakdown } from '../components/CategoryBreakdown';
import { SpendingTrends } from '../components/SpendingTrends';
import { useReceipts } from '../../receipts/hooks/useReceipts';
import { ChevronDown, Calendar, Printer, Download } from 'lucide-react';
import { formatDate } from '../../../shared/utils/date';

const ReportsPage = () => {
  const { receipts, loading, error } = useReceipts();
  const [timeframe, setTimeframe] = useState('month');
  
  const timeframeOptions = [
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 3 Months' },
    { value: 'year', label: 'Last 12 Months' }
  ];
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleExport = () => {
    // In a real app, this would generate and download a report
    alert('Export functionality would go here');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading size="lg" />
      </div>
    );
  }
  
  if (error) {
    return <Alert type="error" message={error} />;
  }
  
  const today = new Date();
  const startDate = new Date(today);
  
  switch (timeframe) {
    case 'week':
      startDate.setDate(today.getDate() - 7);
      break;
    case 'month':
      startDate.setDate(today.getDate() - 30);
      break;
    case 'quarter':
      startDate.setDate(today.getDate() - 90);
      break;
    case 'year':
      startDate.setDate(today.getDate() - 365);
      break;
    default:
      startDate.setDate(today.getDate() - 30);
  }
  
  const filteredReceipts = receipts.filter(receipt => {
    const receiptDate = new Date(receipt.date);
    return receiptDate >= startDate && receiptDate <= today;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        
        <div className="flex space-x-2">
          <Dropdown
            options={timeframeOptions}
            value={timeframe}
            onChange={setTimeframe}
          />
          
          <Button
            variant="secondary"
            icon={Printer}
            onClick={handlePrint}
          >
            Print
          </Button>
          
          <Button
            variant="secondary"
            icon={Download}
            onClick={handleExport}
          >
            Export
          </Button>
        </div>
      </div>
      
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Spending Overview</h2>
          <p className="text-sm text-gray-500">
            {formatDate(startDate)} - {formatDate(today)}
          </p>
        </div>
        
        <div className="h-80">
          <SpendingChart data={filteredReceipts} />
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
          <div className="h-80">
            <CategoryBreakdown data={filteredReceipts} />
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Spending Trends</h2>
          <div className="h-80">
            <SpendingTrends data={filteredReceipts} timeframe={timeframe} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
