// src/components/products/ProductFilters.tsx

import React from 'react';
import { Filter, X } from 'lucide-react';
import { ProductFilters as Filters } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ProductFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  categories: string[];
  isOpen: boolean;
  onToggle: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
  isOpen,
  onToggle,
}) => {
  const handleFilterChange = (key: keyof Filters, value: any) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit,
    });
  };

  const hasActiveFilters =
    filters.category || filters.minPrice || filters.maxPrice || filters.search;

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          onClick={onToggle}
          variant="outline"
          className="w-full justify-center bg-white border border-gray-300 shadow-sm hover:bg-blue-50 transition"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              !
            </span>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      <div
        className={`${
          isOpen ? 'block' : 'hidden'
        } lg:block bg-white border border-gray-200 shadow-md rounded-xl p-6 space-y-6 transition duration-300`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Filters</h3>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="ghost" size="sm">
                Clear All
              </Button>
            )}
            <button
              onClick={onToggle}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Category
          </label>
          <div className="grid gap-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={!filters.category}
                onChange={() => handleFilterChange('category', undefined)}
                className="accent-blue-600"
              />
              All Categories
            </label>
            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer capitalize"
              >
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === category}
                  onChange={() => handleFilterChange('category', category)}
                  className="accent-blue-600"
                />
                {category}
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Price Range
          </label>
          <div className="flex gap-3">
            <Input
              type="number"
              placeholder="Min"
              className="rounded-lg px-4 py-2 border border-gray-300 shadow-sm focus:ring focus:ring-blue-200"
              value={filters.minPrice || ''}
              onChange={(e) =>
                handleFilterChange(
                  'minPrice',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
            <Input
              type="number"
              placeholder="Max"
              className="rounded-lg px-4 py-2 border border-gray-300 shadow-sm focus:ring focus:ring-blue-200"
              value={filters.maxPrice || ''}
              onChange={(e) =>
                handleFilterChange(
                  'maxPrice',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Sort By
          </label>
          <select
            value={`${filters.sortBy || 'price'}-${filters.sortOrder || 'asc'}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              handleFilterChange('sortBy', sortBy);
              handleFilterChange('sortOrder', sortOrder);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-500 bg-white text-gray-800"
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Rating: Highest Rated</option>
          </select>
        </div>
      </div>
    </>
  );
};
