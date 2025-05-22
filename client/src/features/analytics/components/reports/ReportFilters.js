import { FileBarChart, X } from 'lucide-react';
import React from 'react';

import { Button } from '../../../../shared/components/forms/Button';
import { Dropdown } from '../../../../shared/components/forms/Dropdown';
import { DateRangePicker } from '../../../../shared/components/ui/DateRangePicker';
import { useCategories } from '../../../categories/hooks/useCategories';

export const ReportFilters = ({ filters, onChange, onReset }) => {
  const { categories } = useCategories();

  const reportTypes = [
    { value: 'spending', label: 'Spending Overview' },
    { value: 'categories', label: 'Category Analysis' },
    { value: 'trends', label: 'Monthly Trends' },
    { value: 'budget', label: 'Budget Progress' },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Dropdown
          options={reportTypes}
          value={filters.reportType}
          onChange={value => onChange({ ...filters, reportType: value })}
          placeholder="Select report type"
          icon={FileBarChart}
        />

        <DateRangePicker
          startDate={filters.startDate}
          endDate={filters.endDate}
          onChange={dates =>
            onChange({
              ...filters,
              startDate: dates.startDate,
              endDate: dates.endDate,
            })
          }
        />

        {filters.reportType === 'categories' && (
          <Dropdown
            options={categories.map(cat => ({
              value: cat.id,
              label: cat.name,
            }))}
            value={filters.category}
            onChange={value => onChange({ ...filters, category: value })}
            placeholder="Select category"
          />
        )}
      </div>

      {Object.values(filters).some(Boolean) && (
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" size="sm" icon={X} onClick={onReset}>
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
};
