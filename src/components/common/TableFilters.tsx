import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange';
  options?: FilterOption[];
  placeholder?: string;
}

interface TableFiltersProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterConfig[];
  filterValues?: Record<string, any>;
  onFilterChange?: (key: string, value: any) => void;
  onClearFilters?: () => void;
  showFilterButton?: boolean;
}

const TableFilters = ({
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,
  showFilterButton = true,
}: TableFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = Object.values(filterValues).some(
    (value) => value !== undefined && value !== null && value !== ''
  );

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        {onSearchChange && (
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Filter Toggle Button */}
        {showFilterButton && filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {Object.values(filterValues).filter(v => v).length}
              </span>
            )}
          </button>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <X size={18} />
            Clear
          </button>
        )}
      </div>

      {/* Filter Inputs */}
      {showFilters && filters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                {filter.label}
              </label>

              {filter.type === 'select' && (
                <select
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{filter.placeholder || 'All'}</option>
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {filter.type === 'date' && (
                <input
                  type="date"
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}

              {filter.type === 'daterange' && (
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filterValues[`${filter.key}_start`] || ''}
                    onChange={(e) => onFilterChange?.(`${filter.key}_start`, e.target.value)}
                    placeholder="Start"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="date"
                    value={filterValues[`${filter.key}_end`] || ''}
                    onChange={(e) => onFilterChange?.(`${filter.key}_end`, e.target.value)}
                    placeholder="End"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TableFilters;
