'use client';

import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '@repo/api';
import { CategoryCard } from '@/components/home/CategoryCard';

export default function CategoriesPage() {
  const { data: categoriesResponse, isLoading, error } = useQuery({
    queryKey: ['all-categories'],
    queryFn: () => categoriesService.getCategories({ include_counts: true }),
    retry: 3,
    retryDelay: 1000,
  });

  console.log('Categories page data:', { categoriesResponse, isLoading, error });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Categories</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Categories</h1>
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            Failed to load categories: {error.message}
            <div className="mt-2 text-sm">
              Please check your internet connection and try again.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categories = categoriesResponse?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">All Categories</h1>
        <p className="text-lg text-gray-600">
          Browse our complete collection of product categories
        </p>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📂</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-600">Categories will appear here once they are added.</p>
        </div>
      )}
    </div>
  );
}
