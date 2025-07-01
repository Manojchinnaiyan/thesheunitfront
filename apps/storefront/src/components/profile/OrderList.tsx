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

  const downloadInvoice = async (orderId: number, orderNumber: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      
      const response = await fetch(
        `${apiUrl}/orders/${orderId}/invoice`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept": "text/html",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Invoice API Error:", errorText);
        throw new Error(`Failed to load invoice: ${response.status}`);
      }

      // Get the HTML content
      const htmlContent = await response.text();

      // Open in new window/tab
      const newWindow = window.open("", "_blank", "width=800,height=600");
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        newWindow.focus();
        
        // Add print button
        setTimeout(() => {
          const printButton = newWindow.document.createElement('button');
          printButton.innerHTML = 'Print Invoice';
          printButton.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 1000; padding: 10px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;';
          printButton.onclick = () => newWindow.print();
          newWindow.document.body.appendChild(printButton);
        }, 100);
      } else {
        // Fallback: Download as HTML file
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderNumber}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        alert("Invoice downloaded successfully!");
      }
    } catch (error) {
      console.error("Error loading invoice:", error);
      alert(`Failed to load invoice: ${error.message}`);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
        <div className="flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="ml-2 text-red-500 hover:text-red-700 text-lg font-bold"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && orders.length === 0) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!isLoading && orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-600 mb-6">
          Start shopping to see your orders here.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Order #{order.order_number}
              </h3>
              <p className="text-gray-600">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
              <p className="text-lg font-medium text-gray-900 mt-1">
                {formatCurrency(order.total_amount / 100)}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/orders/${order.id}`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                View Details
              </Link>
              
              <button
                onClick={() => downloadInvoice(order.id, order.order_number)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Download Invoice
              </button>

              {["pending", "confirmed", "processing"].includes(order.status.toLowerCase()) && (
                <button
                  onClick={() => setShowCancelModal(order.id)}
                  className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {pagination.current_page} of {pagination.total_pages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pagination.total_pages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cancel Order</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for canceling this order:
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Reason for cancellation..."
            />
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(null);
                  setCancelReason("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Keep Order
              </button>
              <button
                onClick={() => handleCancelOrder(showCancelModal)}
                disabled={!cancelReason.trim() || cancellingOrder === showCancelModal}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {cancellingOrder === showCancelModal ? "Canceling..." : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
