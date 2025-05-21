import React, { useState } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Dropdown } from '../../../shared/components/forms/Dropdown';
import { Alert } from '../../../shared/components/ui/Alert';
import { useToast } from '../../../shared/hooks/useToast';
import { FileDown, FileText, Download } from 'lucide-react';

export const ExportSettings = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    dateRange: 'all',
    includeImages: false
  });
  
  const formats = [
    { value: 'csv', label: 'CSV' },
    { value: 'json', label: 'JSON' },
    { value: 'pdf', label: 'PDF' }
  ];
  
  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];
  
  const handleExport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, call your export API here
      // For this example, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showToast(`Data exported as ${exportOptions.format.toUpperCase()} successfully`, 'success');
    } catch (err) {
      setError('Failed to export data. Please try again.');
      showToast('Export failed', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Data Export</h2>
      
      {error && (
        <Alert 
          type="error" 
          message={error} 
          className="mb-4" 
        />
      )}
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dropdown
            label="Export Format"
            options={formats}
            value={exportOptions.format}
            onChange={(value) => setExportOptions({ ...exportOptions, format: value })}
          />
          
          <Dropdown
            label="Date Range"
            options={dateRanges}
            value={exportOptions.dateRange}
            onChange={(value) => setExportOptions({ ...exportOptions, dateRange: value })}
          />
          
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="includeImages"
              checked={exportOptions.includeImages}
              onChange={(e) => setExportOptions({ 
                ...exportOptions, 
                includeImages: e.target.checked 
              })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="includeImages" className="ml-2 text-sm text-gray-700">
              Include receipt images (where available)
            </label>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Export your receipt data in your chosen format.
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              icon={FileText}
              onClick={() => showToast('Template downloaded', 'success')}
            >
              Download Template
            </Button>
            
            <Button
              onClick={handleExport}
              loading={loading}
              icon={FileDown}
            >
              Export Data
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExportSettings;
