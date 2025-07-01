"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { useAddressStore } from "@/store/address";
import { AddressCard } from "@/components/profile/AddressCard";
import { AddressForm } from "@/components/checkout/AddressForm";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const {
    addresses,
    isLoading,
    error,
    fetchAddresses,
    createAddress,
    clearError,
  } = useAddressStore();

  const [activeTab, setActiveTab] = useState("overview");
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated, fetchAddresses]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile</h1>
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            <p>Please sign in to view your profile.</p>
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 ml-1"
            >
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleAddAddress = async (addressData: any) => {
    try {
      await createAddress(addressData);
      setShowAddAddressForm(false);
    } catch (error) {
      console.error("Failed to create address:", error);
    }
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: "👤" },
    { id: "addresses", name: "Addresses", icon: "📍" },
    { id: "settings", name: "Settings", icon: "⚙️" },
  ];

  const quickActions = [
    {
      name: "My Orders",
      description: "View and track your orders",
      icon: "📦",
      href: "/orders",
      color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
    },
    {
      name: "Wishlist",
      description: "Items you've saved for later",
      icon: "❤️",
      href: "/wishlist",
      color: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
    },
    {
      name: "Support",
      description: "Get help with your account",
      icon: "💬",
      href: "/contact",
      color: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span className="mr-3">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className={`block p-3 border rounded-lg transition-all ${action.color}`}
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">{action.icon}</span>
                    <div>
                      <div className="text-sm font-medium">{action.name}</div>
                      <div className="text-xs opacity-75">{action.description}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-medium text-gray-900">
                    Account Information
                  </h2>
                  <button className="text-sm text-blue-600 hover:text-blue-500">
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user?.first_name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user?.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Account Status
                    </label>
                    <p className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user?.is_verified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user?.is_verified ? "✓ Verified" : "⚠ Unverified"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Account Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {addresses.length}
                    </div>
                    <div className="text-sm text-gray-600">Saved Addresses</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Link href="/orders" className="block hover:bg-green-100 rounded-lg transition-colors">
                      <div className="text-2xl font-bold text-green-600">
                        View
                      </div>
                      <div className="text-sm text-gray-600">My Orders</div>
                    </Link>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {user?.is_admin ? "Admin" : "Customer"}
                    </div>
                    <div className="text-sm text-gray-600">Account Type</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Recent Activity
                </h2>
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No recent activity
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Your recent orders and activities will appear here.
                  </p>
                  <Link
                    href="/orders"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    View All Orders
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">
                  My Addresses
                </h2>
                <button
                  onClick={() => setShowAddAddressForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Add New Address
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                  <button
                    onClick={clearError}
                    className="ml-2 text-red-800 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              )}

              {showAddAddressForm && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Add New Address
                  </h3>
                  <AddressForm
                    initialData={{
                      first_name: user?.first_name || "",
                      last_name: user?.last_name || "",
                    }}
                    onSubmit={handleAddAddress}
                    onCancel={() => setShowAddAddressForm(false)}
                    submitLabel="Add Address"
                    isLoading={isLoading}
                  />
                </div>
              )}

              {isLoading && !showAddAddressForm ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
                    >
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((address) => (
                    <AddressCard key={address.id} address={address} />
                  ))}
                </div>
              ) : !showAddAddressForm ? (
                <div className="text-center py-12">
                  <div className="bg-gray-50 rounded-lg p-8">
                    <div className="text-4xl mb-4">📍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No addresses yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Add your first address to make checkout faster.
                    </p>
                    <button
                      onClick={() => setShowAddAddressForm(true)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                    >
                      Add Your First Address
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Account Settings
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-3">
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        defaultChecked
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Email notifications for order updates
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        defaultChecked
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Promotional emails and offers
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        SMS notifications
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-3">
                    Privacy
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        defaultChecked
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Make my profile public
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Allow data usage for personalization
                      </span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-base font-medium text-gray-900 mb-3">
                    Security
                  </h3>
                  <div className="space-y-3">
                    <button className="text-sm text-blue-600 hover:text-blue-500">
                      Change Password
                    </button>
                    <br />
                    <button className="text-sm text-blue-600 hover:text-blue-500">
                      Enable Two-Factor Authentication
                    </button>
                    <br />
                    <button className="text-sm text-red-600 hover:text-red-500">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
