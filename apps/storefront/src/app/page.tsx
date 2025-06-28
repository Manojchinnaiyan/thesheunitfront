'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { productsService, categoriesService } from '@repo/api';
import { ProductCard } from '@/components/products/ProductCard';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryCard } from '@/components/home/CategoryCard';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { PromoBanner } from '@/components/home/PromoBanner';
import { Newsletter } from '@/components/home/Newsletter';

export default function HomePage() {
  // Fetch featured products
  const { data: featuredProducts, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsService.getProducts({
      page: 1,
      limit: 8,
      is_featured: true,
      is_active: true
    }),
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch root categories for homepage display  
  const { data: categoriesResponse, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['root-categories'],
    queryFn: () => categoriesService.getRootCategories(),
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch latest products
  const { data: latestProducts, isLoading: latestLoading, error: latestError } = useQuery({
    queryKey: ['latest-products'],
    queryFn: () => productsService.getProducts({
      page: 1,
      limit: 4,
      sort_by: 'created_at',
      sort_order: 'desc',
      is_active: true
    }),
    retry: 3,
    retryDelay: 1000,
  });

  console.log('Homepage data:', {
    categoriesResponse,
    categoriesLoading,
    categoriesError,
    featuredProducts,
    productsLoading,
    productsError
  });

  const categories = categoriesResponse?.data || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Promo Banner */}
      <PromoBanner />

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600">
              Discover our wide range of product categories
            </p>
          </div>

          {categoriesError && (
            <div className="mb-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              Error loading categories: {categoriesError.message}
            </div>
          )}

          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-32 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.slice(0, 6).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No categories available</h3>
              <p className="text-gray-600">Categories will appear here once they are added.</p>
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              href="/categories"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              View All Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts 
        products={featuredProducts?.data?.products || []} 
        isLoading={productsLoading} 
      />

      {/* Latest Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Latest Arrivals
            </h2>
            <p className="text-lg text-gray-600">
              Check out our newest products
            </p>
          </div>

          {latestError && (
            <div className="mb-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              Error loading latest products: {latestError.message}
            </div>
          )}

          {latestLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestProducts?.data?.products?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
