// src/pages/ProductsPage.tsx

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/products/ProductCard';
import { ProductFilters } from '../components/products/ProductFilters';
import { Product, ProductFilters as Filters } from '../types';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    category: searchParams.get('category') || undefined,
    search: searchParams.get('search') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    sortBy: (searchParams.get('sortBy') as any) || 'price',
    sortOrder: (searchParams.get('sortOrder') as any) || 'asc',
    page: Number(searchParams.get('page')) || 1,
    limit: 12,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
    updateSearchParams();
  }, [filters]);

  const loadCategories = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);

      if (data) {
        const uniqueCategories = [...new Set(data.map(item => item.category))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      if (filters.category) query = query.eq('category', filters.category);
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.minPrice) query = query.gte('price', filters.minPrice);
      if (filters.maxPrice) query = query.lte('price', filters.maxPrice);

      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });

      const from = ((filters.page || 1) - 1) * (filters.limit || 12);
      const to = from + (filters.limit || 12) - 1;
      query = query.range(from, to);

      const { data, count } = await query;

      if (data) {
        setProducts(data);
        setTotalCount(count || 0);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const totalPages = Math.ceil(totalCount / (filters.limit || 12));
  const currentPage = filters.page || 1;

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            Shop All Products
          </h1>
          <p className="text-gray-600 text-lg">
            {totalCount} product{totalCount !== 1 ? 's' : ''} found
            {filters.search && ` for "${filters.search}"`}
            {filters.category && ` in ${filters.category}`}
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-10">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1 bg-white shadow rounded-xl p-4 sticky top-28 z-10">
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              categories={categories}
              isOpen={filtersOpen}
              onToggle={() => setFiltersOpen(!filtersOpen)}
            />
          </div>

          {/* Product Section */}
          <div className="lg:col-span-3 mt-10 lg:mt-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="h-96 bg-gradient-to-br from-gray-200/60 to-white rounded-xl animate-pulse shadow-inner"
                  />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center flex-wrap gap-2">
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <ChevronLeft />
                    </Button>

                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const page = Math.max(1, currentPage - 2) + i;
                      if (page > totalPages) return null;

                      return (
                        <Button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          size="sm"
                          variant={page === currentPage ? 'default' : 'outline'}
                        >
                          {page}
                        </Button>
                      );
                    })}

                    <Button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <ChevronRight />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  No products found
                </h2>
                <p className="text-gray-600 mb-6">
                  Try resetting your filters or search terms
                </p>
                <Button onClick={() => handleFiltersChange({})} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
