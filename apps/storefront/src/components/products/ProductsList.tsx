"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { productsService, type ProductListParams } from "@repo/api";
import { ProductCard } from "./ProductCard";

export function ProductsList() {
  const [filters, setFilters] = useState<ProductListParams>({
    page: 1,
    limit: 12,
    sort_by: "created_at",
    sort_order: "desc",
  });

  const {
    data: productsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const result = await productsService.getProducts(filters);
      console.log("Products query result:", result);
      return result;
    },
    retry: 1,
  });

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleSortChange = (sortBy: string, sortOrder: "asc" | "desc") => {
    setFilters((prev) => ({
      ...prev,
      sort_by: sortBy,
      sort_order: sortOrder,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  if (error) {
    console.error("Products API error:", error);
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded max-w-md mx-auto">
          <h3 className="font-semibold mb-2">Failed to load products</h3>
          <p className="text-sm mb-2">
            Please make sure your backend is running on localhost:8080.
          </p>
          <p className="text-xs text-gray-500">
            Error: {error?.message || "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  // Extract the actual products data
  const products = productsResponse?.data?.products;
  const pagination = productsResponse?.data?.pagination;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header and Filters */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Products</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split(":");
                handleSortChange(sortBy, sortOrder as "asc" | "desc");
              }}
            >
              <option value="created_at:desc">Newest First</option>
              <option value="created_at:asc">Oldest First</option>
              <option value="name:asc">Name A-Z</option>
              <option value="name:desc">Name Z-A</option>
              <option value="price:asc">Price Low to High</option>
              <option value="price:desc">Price High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {products && Array.isArray(products) && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.has_prev}
                className="btn-outline px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="text-gray-600">
                Page {pagination.page} of {pagination.total_pages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.has_next}
                className="btn-outline px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}

          {/* Results count */}
          {pagination && (
            <div className="text-center text-gray-600 mt-4">
              Showing {products.length} of {pagination.total} products
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {products && products.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters, or add some products to your
              backend.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
