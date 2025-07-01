"use client";

import { useState } from "react";
import Link from "next/link";
import type { Order } from "@repo/types";

interface OrderActionsProps {
  order: Order;
  onCancel: () => void;
  canCancel: boolean;
}

export function OrderActions({
  order,
  onCancel,
  canCancel,
}: OrderActionsProps) {
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  const handleDownloadInvoice = async () => {
    setDownloadingInvoice(true);
    try {
      const token = localStorage.getItem("access_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      
      const response = await fetch(
        `${apiUrl}/orders/${order.id}/invoice`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept": "text/html",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Invoice API Error:", errorData);
        throw new Error(`Failed to load invoice: ${response.status} ${response.statusText}`);
      }

      // Get the HTML content
      const htmlContent = await response.text();

      // Create a new window with the invoice
      const newWindow = window.open("", "_blank", "width=800,height=600,scrollbars=yes,resizable=yes");
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        newWindow.focus();
        
        // Add print functionality after content loads
        setTimeout(() => {
          const printButton = newWindow.document.createElement('button');
          printButton.innerHTML = 'Print Invoice';
          printButton.style.cssText = `
            position: fixed; 
            top: 10px; 
            right: 10px; 
            z-index: 1000; 
            padding: 10px 15px; 
            background: #007bff; 
            color: white; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer;
            font-size: 14px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          `;
          printButton.onclick = () => newWindow.print();
          newWindow.document.body.appendChild(printButton);
        }, 500);
      } else {
        // Fallback: Download as HTML file
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${order.order_number}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        alert("Invoice downloaded to your Downloads folder!");
      }
    } catch (error) {
      console.error("Error loading invoice:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Failed to load invoice: ${errorMessage}`);
    } finally {
      setDownloadingInvoice(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Order Actions</h3>

      <div className="space-y-3">
        {/* Download Invoice */}
        <button
          onClick={handleDownloadInvoice}
          disabled={downloadingInvoice}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {downloadingInvoice ? "Loading Invoice..." : "Download Invoice"}
        </button>

        {/* Cancel Order */}
        {canCancel && (
          <button
            onClick={onCancel}
            className="w-full flex items-center justify-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Cancel Order
          </button>
        )}

        {/* View Tracking */}
        {order.tracking_number && (
          <Link
            href={`/orders/${order.id}/track`}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            Track Package
          </Link>
        )}

        {/* Contact Support */}
        <Link
          href="/contact"
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.458l-3.094.892.892-3.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
            />
          </svg>
          Contact Support
        </Link>
      </div>
    </div>
  );
}
