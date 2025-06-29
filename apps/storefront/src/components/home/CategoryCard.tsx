'use client';

import Link from 'next/link';

interface CategoryCardProps {
  category: {
    id: number;
    name: string;
    slug: string;
    description: string;
    image: string;
  };
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
  'default': '🛍️'
};

const categoryColors: Record<string, string> = {
  'Electronics': 'from-blue-400 to-blue-600',
  'Clothing': 'from-pink-400 to-pink-600',
  'Books': 'from-green-400 to-green-600',
  'Home & Garden': 'from-yellow-400 to-yellow-600',
  'Sports & Outdoors': 'from-red-400 to-red-600',
  'Beauty': 'from-purple-400 to-purple-600',
  'Toys': 'from-indigo-400 to-indigo-600',
  'Food': 'from-orange-400 to-orange-600',
  'Health': 'from-teal-400 to-teal-600',
  'Automotive': 'from-gray-400 to-gray-600',
  'default': 'from-blue-400 to-blue-600'
};

export function CategoryCard({ category }: CategoryCardProps) {
  const icon = categoryIcons[category.name] || categoryIcons.default;
  const gradient = categoryColors[category.name] || categoryColors.default;

  return (
    <Link
      href={`/products?category_id=${category.id}`}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className={`h-20 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
            {category.image ? (
              <img 
                src={category.image} 
                alt={category.name}
                className="w-8 h-8 object-cover"
              />
            ) : (
              <span className="text-white filter drop-shadow-lg">{icon}</span>
            )}
          </div>
        </div>
        
        <div className="p-3 text-center">
          <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
            {category.name}
          </h3>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl"></div>
      </div>
    </Link>
  );
}
