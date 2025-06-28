"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { useEffect } from "react";

export function Header() {
  const { user, isAuthenticated, logout, initialize } = useAuthStore();
  const { getItemCount, fetchCart } = useCartStore();

  useEffect(() => {
    initialize();
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, initialize, fetchCart]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 hover:text-blue-600"
            >
              TheShe Unit
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/products"
              className="text-gray-600 hover:text-gray-900"
            >
              Products
            </Link>
            <Link
              href="/categories"
              className="text-gray-600 hover:text-gray-900"
            >
              Categories
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">
                  Welcome, {user?.first_name}
                </span>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Register
                </Link>
              </>
            )}

            <Link href="/cart" className="btn-primary px-3 py-2">
              Cart ({getItemCount()})
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
