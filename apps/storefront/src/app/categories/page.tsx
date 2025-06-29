"use client";

import { useState, useEffect } from "react";
import { CategoryCard } from "@/components/home/CategoryCard";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        console.log("🔄 Fetching categories...");
        setLoading(true);
        setError(null);

        const response = await fetch(
          "http://localhost:8080/api/v1/products/categories"
        );
        console.log("📡 Response status:", response.status);

        if (!response.ok) {
          throw new Error(
            `API returned ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("📦 Categories data:", data);

        setCategories(data.data || []);
        setLoading(false);
      } catch (err: any) {
        console.error("💥 Error fetching categories:", err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (loading) {
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
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded max-w-md mx-auto">
            <p>
              <strong>Error:</strong> {error}
            </p>
            <div className="mt-4 text-sm text-left">
              <p>
                <strong>Troubleshooting:</strong>
              </p>
              <ul className="list-disc ml-4 mt-2">
                <li>Check if backend is running on http://localhost:8080</li>
                <li>Verify categories exist in database</li>
                <li>Check browser console for CORS errors</li>
                <li>
                  Test API directly:{" "}
                  <code className="bg-gray-100 px-1">
                    curl http://localhost:8080/api/v1/products/categories
                  </code>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          All Categories
        </h1>
        <p className="text-lg text-gray-600">
          Browse our complete collection of product categories (
          {categories.length} found)
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
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No categories found
          </h3>
          <p className="text-gray-600">
            Categories will appear here once they are added.
          </p>
        </div>
      )}
    </div>
  );
}
