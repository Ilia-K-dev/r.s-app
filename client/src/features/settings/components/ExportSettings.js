import React, { useState } from 'react';//correct
import { Card } from '../../../shared/components/ui/Card';//correct
import { Button } from '../../../shared/components/forms/Button';//correct
import { Alert } from '../../../shared/components/ui/Alert';//correct
import { Dropdown } from '../../../shared/components/forms/Dropdown';//correct
import { useSettings } from '../../../features/settings/hooks/useSettings';//correct
import { useToast } from '../../../shared/hooks/useToast';//correct
import { 
  Download, 
  Upload, 
  FileText, 
  Calendar,
  Database,
  Settings,
  AlertTriangle 
} from 'lucide-react';//correct

const ExportSettings = () => {
  const { settings, exportSettings, importSettings } = useSettings();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('all');

  const exportFormats = [
    { value: 'csv', label: 'CSV Format' },
    { value: 'excel', label: 'Excel Format' },
    { value: 'json', label: 'JSON Format' },
    { value: 'pdf', label: 'PDF Format' }
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  const dataTypes = [
    {
      id: 'receipts',
      title: 'Receipts',
      description: 'Export all receipt data and images',
      icon: FileText,
      defaultEnabled: true
    },
    {
      id: 'categories',
      title: 'Categories',
      description: 'Export category configurations and budgets',
      icon: Database,
      defaultEnabled: true
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Export app settings and preferences',
      icon: Settings,
      defaultEnabled: false
    }
  ];

  const [selectedTypes, setSelectedTypes] = useState(
    dataTypes.reduce((acc, type) => ({
      ...acc,
      [type.id]: type.defaultEnabled
    }), {})
  );

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);

      const exportConfig = {
        format: exportFormat,
        dateRange,
        types: Object.keys(selectedTypes).filter(key => selectedTypes[key])
      };

      await exportSettings(exportConfig);
      showToast('Data exported successfully', 'success');
    } catch (err) {
      setError('Failed to export data');
      showToast('Export failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      // Verify file type
      const validTypes = ['.json', '.backup'];
      const isValidType = validTypes.some(type => file.name.toLowerCase().endsWith(type));
      
      if (!isValidType) {
        throw new Error('Invalid file type. Please select a valid backup file.');
      }

      await importSettings(file);
      showToast('Settings imported successfully', 'success');
    } catch (err) {
      setError(err.message || 'Failed to import settings');
      showToast('Import failed', 'error');
    } finally {
      setLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          Export & Import Settings
        </h3>

        {error && (
          <Alert
            type="error"
            message={error}
            className="mb-6"
          />
        )}

        {/* Export Section */}
        <div className="space-y-6 mb-8">
          <h4 className="text-sm font-medium text-gray-900">Export Data</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Dropdown
              label="Export Format"
              options={exportFormats}
              value={exportFormat}
              onChange={setExportFormat}
            />

            <Dropdown
              label="Date Range"
              options={dateRanges}
              value={dateRange}
              onChange={setDateRange}
            />
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">Select Data to Export</p>
            {dataTypes.map(({ id, title, description, icon: Icon }) => (
              <div key={id} className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  id={id}
                  checked={selectedTypes[id]}
                  onChange={(e) => setSelectedTypes(prev => ({
                    ...prev,
                    [id]: e.target.checked
                  }))}
                  className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <div className="flex items-center space-x-3 flex-1">
                  <div className="p-2 rounded-full bg-gray-100">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <label htmlFor={id} className="text-sm font-medium text-gray-900">
                      {title}
                    </label>
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleExport}
            loading={loading}
            icon={Download}
            disabled={!Object.values(selectedTypes).some(v => v)}
          >
            Export Data
          </Button>
        </div>

        {/* Import Section */}
        <div className="pt-6 border-t">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Import Settings</h4>
          
          <Alert
            type="warning"
            icon={AlertTriangle}
            title="Warning"
            message="Importing settings will override your current configuration. Make sure to backup your current settings first."
            className="mb-4"
          />

          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              icon={Upload}
              onClick={() => document.getElementById('settings-import').click()}
              loading={loading}
            >
              Import Settings
            </Button>
            <input
              id="settings-import"
              type="file"
              accept=".json,.backup"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExportSettings;