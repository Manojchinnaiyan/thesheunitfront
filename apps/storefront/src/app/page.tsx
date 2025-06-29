'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { productsService } from '@repo/api';
import { ProductCard } from '@/components/products/ProductCard';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryCard } from '@/components/home/CategoryCard';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { DealsSection } from '@/components/home/DealsSection';
import { Newsletter } from '@/components/home/Newsletter';
import { TrustBadges } from '@/components/home/TrustBadges';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('http://localhost:8080/api/v1/products/categories');
        const data = await response.json();
        setCategories(data.data || []);
        setCategoriesLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoriesLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // Fetch featured products
  const { data: featuredProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsService.getProducts({
      page: 1,
      limit: 8,
      is_featured: true,
      is_active: true
    }),
  });

  // Fetch latest products
  const { data: latestProducts, isLoading: latestLoading } = useQuery({
    queryKey: ['latest-products'],
    queryFn: () => productsService.getProducts({
      page: 1,
      limit: 6,
      sort_by: 'created_at',
      sort_order: 'desc',
      is_active: true
    }),
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Modern Design */}
      <HeroSection />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Categories Section - Inspired by Amazon */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Shop by Category
              </h2>
              <p className="text-gray-600 mt-2">Find exactly what you're looking for</p>
            </div>
            <Link
              href="/categories"
              className="hidden md:flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              See all categories
              <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-xl h-24 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Flash Deals Section - Inspired by e-commerce platforms */}
      <DealsSection />

      {/* Featured Products - Amazon/Shopify Style */}
      <FeaturedProducts 
        products={featuredProducts?.data?.products || []} 
        isLoading={productsLoading} 
      />

      {/* New Arrivals - Modern Grid Layout */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                New Arrivals
              </h2>
              <p className="text-gray-600 mt-2">Fresh products just for you</p>
            </div>
            <Link
              href="/products?sort_by=created_at&sort_order=desc"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              View all
              <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>

          {latestLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestProducts?.data?.products?.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Customer Testimonials */}
      <TestimonialsSection />

      {/* Newsletter - Modern Design */}
      <Newsletter />
    </div>
  );
}
