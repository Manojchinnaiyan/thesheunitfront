"use client";

import { useState, useEffect } from "react";
import { useOrderStore } from "@/store/order";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export function OrderList() {
  const {
    orders,
    pagination,
    isLoading,
    error,
    fetchOrders,
    cancelOrder,
    clearError,
  } = useOrderStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [cancellingOrder, setCancellingOrder] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, fetchOrders]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!cancelReason.trim()) return;

    setCancellingOrder(orderId);
    try {
      await cancelOrder(orderId, cancelReason);
      setShowCancelModal(null);
      setCancelReason("");
      // Refresh orders
      await fetchOrders(currentPage);
    } catch (error) {
      console.error("Failed to cancel order:", error);
    } finally {
      setCancellingOrder(null);
    }
  };

  const downloadInvoice = async (orderId: number) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/invoice`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load invoice");
      }

      // Get the HTML content
      const htmlContent = await response.text();

      // Open in new window/tab
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        newWindow.focus();
      } else {
        alert("Please allow popups to view the invoice, or try again.");
      }
    } catch (error) {
      console.error("Error loading invoice:", error);
      alert("Failed to load invoice. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-indigo-100 text-indigo-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-medium">Error loading orders</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={() => {
            clearError();
            fetchOrders(currentPage);
          }}
          className="text-sm underline mt-2"
        >
          Try again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No orders yet
        </h3>
        <p className="text-gray-500 mb-6">
          When you place orders, they'll appear here.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Order History</h2>
        <p className="text-sm text-gray-500">
          {pagination?.total} total orders
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow border p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-medium text-gray-900">
                  Order #{order.order_number}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                >
                  {order.status}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}
                >
                  Payment: {order.payment_status}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </p>
                <div className="mt-1">
                  {order.items.slice(0, 2).map((item, index) => (
                    <span key={item.id} className="text-sm text-gray-800">
                      {item.name}
                      {index < Math.min(order.items.length, 2) - 1 && ", "}
                    </span>
                  ))}
                  {order.items.length > 2 && (
                    <span className="text-sm text-gray-500">
                      {" "}
                      and {order.items.length - 2} more
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {formatCurrency(order.total_amount / 100)}
                </p>
              </div>
            </div>

            {order.tracking_number && (
              <div className="mb-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Tracking:</span>{" "}
                  {order.tracking_number}
                  {order.shipping_carrier && (
                    <span> via {order.shipping_carrier}</span>
                  )}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t">
              <Link
                href={`/orders/${order.id}`}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                View Details
              </Link>

              <div className="flex space-x-3">
                <Link
                  href={`/orders/${order.id}/track`}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Track Order
                </Link>

                {order.status === "delivered" && (
                  <Link
                    href={`/orders/${order.id}/review`}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Write Review
                  </Link>
                )}

                {(order.status === "pending" ||
                  order.status === "confirmed") && (
                  <button
                    onClick={() => setShowCancelModal(order.id)}
                    className="text-sm text-red-600 hover:text-red-500"
                  >
                    Cancel Order
                  </button>
                )}

                <button
                  onClick={() => downloadInvoice(order.id, order.order_number)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Download Invoice
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.has_prev}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.has_next}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page {pagination.page} of {pagination.total_pages}
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.has_prev}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page numbers */}
                {Array.from(
                  { length: Math.min(5, pagination.total_pages) },
                  (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          pageNum === currentPage
                            ? "bg-blue-600 text-white focus:z-20"
                            : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.has_next}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Cancel Order
            </h3>

            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>

            <div className="mb-4">
              <label
                htmlFor="cancelReason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Reason for cancellation *
              </label>
              <textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please tell us why you're cancelling this order..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(null);
                  setCancelReason("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={cancellingOrder === showCancelModal}
              >
                Keep Order
              </button>
              <button
                onClick={() => handleCancelOrder(showCancelModal)}
                disabled={
                  !cancelReason.trim() || cancellingOrder === showCancelModal
                }
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancellingOrder === showCancelModal
                  ? "Cancelling..."
                  : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
