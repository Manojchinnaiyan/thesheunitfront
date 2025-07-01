"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { ordersService } from "@repo/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TrackingInfo {
  order_number: string;
  status: string;
  payment_status: string;
  tracking_number?: string;
  shipping_carrier?: string;
  shipped_at?: string;
  delivered_at?: string;
  estimated_delivery?: string;
  status_history: any[];
}

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchTrackingInfo();
  }, [isAuthenticated, params.id, router]);

  const fetchTrackingInfo = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await ordersService.trackOrder(parseInt(params.id));
      setTrackingInfo(data);
    } catch (err: any) {
      console.error("Failed to fetch tracking info:", err);
      setError(err.message || "Failed to load tracking information");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "confirmed":
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStepStatus = (stepStatus: string, currentStatus: string) => {
    const statusOrder = ["pending", "confirmed", "processing", "shipped", "delivered"];
    const stepIndex = statusOrder.indexOf(stepStatus.toLowerCase());
    const currentIndex = statusOrder.indexOf(currentStatus.toLowerCase());
    
    if (stepIndex <= currentIndex) {
      return "completed";
    } else if (stepIndex === currentIndex + 1) {
      return "current";
    } else {
      return "upcoming";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const trackingSteps = [
    {
      id: "pending",
      name: "Order Placed",
      description: "Your order has been received",
      icon: "📝"
    },
    {
      id: "confirmed",
      name: "Order Confirmed",
      description: "Payment confirmed and order processing",
      icon: "✅"
    },
    {
      id: "processing",
      name: "Processing",
      description: "Your order is being prepared",
      icon: "📦"
    },
    {
      id: "shipped",
      name: "Shipped",
      description: "Your order is on its way",
      icon: "🚚"
    },
    {
      id: "delivered",
      name: "Delivered",
      description: "Order has been delivered",
      icon: "🎉"
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Tracking</h1>
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            <p>Please sign in to track your order.</p>
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 ml-1">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !trackingInfo) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Tracking</h1>
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error || "Tracking information not available"}
          </div>
          <Link
            href={`/orders/${params.id}`}
            className="inline-flex items-center mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            ← Back to Order Details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href={`/orders/${params.id}`}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            ← Back to Order Details
          </Link>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Track Order #{trackingInfo.order_number}
          </h1>
          <div className="mt-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(trackingInfo.status)}`}>
              {trackingInfo.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Tracking Number & Carrier */}
      {trackingInfo.tracking_number && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Tracking Information</h3>
            <div className="space-y-2">
              <p className="text-blue-800">
                <span className="font-medium">Tracking Number:</span> {trackingInfo.tracking_number}
              </p>
              {trackingInfo.shipping_carrier && (
                <p className="text-blue-800">
                  <span className="font-medium">Carrier:</span> {trackingInfo.shipping_carrier}
                </p>
              )}
              {trackingInfo.estimated_delivery && (
                <p className="text-blue-800">
                  <span className="font-medium">Estimated Delivery:</span> {formatDate(trackingInfo.estimated_delivery)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Order Progress</h2>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-8">
            {trackingSteps.map((step, index) => {
              const status = getStepStatus(step.id, trackingInfo.status);
              const isCompleted = status === "completed";
              const isCurrent = status === "current";
              
              return (
                <div key={step.id} className="relative flex items-start">
                  {/* Step Icon */}
                  <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    isCompleted 
                      ? "bg-green-600 border-green-600 text-white" 
                      : isCurrent 
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}>
                    {isCompleted ? (
                      <span className="text-sm">✓</span>
                    ) : (
                      <span className="text-lg">{step.icon}</span>
                    )}
                  </div>
                  
                  {/* Step Content */}
                  <div className="ml-4 flex-1">
                    <div className={`font-medium ${
                      isCompleted || isCurrent ? "text-gray-900" : "text-gray-500"
                    }`}>
                      {step.name}
                    </div>
                    <div className={`text-sm ${
                      isCompleted || isCurrent ? "text-gray-600" : "text-gray-400"
                    }`}>
                      {step.description}
                    </div>
                    
                    {/* Show timestamp if completed */}
                    {isCompleted && trackingInfo.status_history && (
                      (() => {
                        const statusEntry = trackingInfo.status_history.find(
                          (h: any) => h.status.toLowerCase() === step.id
                        );
                        return statusEntry ? (
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(statusEntry.created_at)}
                          </div>
                        ) : null;
                      })()
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status History */}
      {trackingInfo.status_history && trackingInfo.status_history.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Detailed History</h2>
          <div className="space-y-4">
            {trackingInfo.status_history
              .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((history: any, index: number) => (
                <div key={history.id || index} className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-b-0">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                    index === 0 ? "bg-blue-600" : "bg-gray-300"
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(history.created_at)}
                      </p>
                    </div>
                    {history.comment && (
                      <p className="text-sm text-gray-600 mt-1">{history.comment}</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 mb-4">
          Need help with your order? Contact our support team.
        </p>
        <div className="space-x-4">
          <Link
            href="/contact"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Contact Support
          </Link>
          <Link
            href="/orders"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
