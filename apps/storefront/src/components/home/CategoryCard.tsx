'use client';

import Link from 'next/link';
import type { Category } from '@repo/types';

interface CategoryCardProps {
  category: Category;
}

const categoryIcons: Record<string, string> = {
  'Electronics': '📱',
  'Clothing': '👕',
  'Books': '📚',
  'Home & Garden': '🏠',
  'Sports & Outdoors': '⚽',
  'Beauty': '💄',
  'Toys': '🧸',
  'Food': '🍕',
  'Health': '🏥',
  'Automotive': '🚗',
  'Fashion': '👗',
  'Accessories': '👜',
  'Shoes': '👟',
  'Jewelry': '💍',
  'default': '🛍️'
};

export function CategoryCard({ category }: CategoryCardProps) {
  const icon = categoryIcons[category.name] || categoryIcons.default;

  return (
    <Link
      href={`/products?category_id=${category.id}`}
      className="group block"
    >
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6 text-center border-2 border-transparent hover:border-blue-200">
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
          {category.image ? (
            <img 
              src={category.image} 
              alt={category.name}
              className="w-12 h-12 mx-auto object-cover rounded-lg"
            />
          ) : (
            icon
          )}
        </div>
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {category.description}
          </p>
        )}
        <div className="mt-4 text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Browse →
        </div>
      </div>
    </Link>
  );
}
