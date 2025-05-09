import React from 'react';//correct
import { Input } from '../../..//shared/components/forms/Input';//correct
import { Dropdown } from '../../../shared/components/forms/Dropdown';//correct
import { Button } from '../../../shared/components/forms/Button';//correct
import { useCategories } from '../../categories/hooks/useCategories';//correct
import { Search, Filter, X } from 'lucide-react';//correct

export const ReceiptFilters = ({ filters, onChange, onReset }) => {
  const { categories } = useCategories();

  const dateRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: 'this_month', label: 'This month' },
    { value: 'last_month', label: 'Last month' },
    { value: 'custom', label: 'Custom range' }
  ];

  const sortOptions = [
    { value: 'date_desc', label: 'Date (Newest first)' },
    { value: 'date_asc', label: 'Date (Oldest first)' },
    { value: 'amount_desc', label: 'Amount (Highest first)' },
    { value: 'amount_asc', label: 'Amount (Lowest first)' }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Search merchants..."
          icon={Search}
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />

        <Dropdown
          options={dateRanges}
          value={filters.dateRange}
          onChange={(value) => onChange({ ...filters, dateRange: value })}
          placeholder="Select date range"
        />

        <Dropdown
          options={categories.map(cat => ({
            value: cat.id,
            label: cat.name
          }))}
          value={filters.category}
          onChange={(value) => onChange({ ...filters, category: value })}
          placeholder="Select category"
        />

        <Dropdown
          options={sortOptions}
          value={filters.sortBy}
          onChange={(value) => onChange({ ...filters, sortBy: value })}
          placeholder="Sort by"
        />
      </div>

      {(filters.search || filters.dateRange || filters.category || filters.sortBy) && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            icon={X}
            onClick={onReset}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};