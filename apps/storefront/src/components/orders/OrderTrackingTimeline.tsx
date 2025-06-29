'use client';

import { formatDateTime } from '@/lib/utils';

interface StatusHistoryItem {
  id: number;
  status: string;
  comment: string;
  created_at: string;
  created_by: number;
}

interface OrderTrackingTimelineProps {
  statusHistory: StatusHistoryItem[];
  currentStatus: string;
}

export function OrderTrackingTimeline({ statusHistory, currentStatus }: OrderTrackingTimelineProps) {
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          icon: '⏳',
          title: 'Order Placed',
          description: 'Your order has been received and is being processed.',
          color: 'bg-yellow-500'
        };
      case 'confirmed':
        return {
          icon: '✅',
          title: 'Order Confirmed',
          description: 'Your order has been confirmed and payment processed.',
          color: 'bg-blue-500'
        };
      case 'processing':
        return {
          icon: '🔄',
          title: 'Processing',
          description: 'Your items are being prepared for shipment.',
          color: 'bg-indigo-500'
        };
      case 'shipped':
        return {
          icon: '🚚',
          title: 'Shipped',
          description: 'Your order is on its way to you.',
          color: 'bg-purple-500'
        };
      case 'out_for_delivery':
        return {
          icon: '🚛',
          title: 'Out for Delivery',
          description: 'Your package is out for delivery today.',
          color: 'bg-orange-500'
        };
      case 'delivered':
        return {
          icon: '📦',
          title: 'Delivered',
          description: 'Your order has been delivered successfully.',
          color: 'bg-green-500'
        };
      case 'cancelled':
        return {
          icon: '❌',
          title: 'Cancelled',
          description: 'This order has been cancelled.',
          color: 'bg-red-500'
        };
      default:
        return {
          icon: '📋',
          title: status.replace('_', ' ').toUpperCase(),
          description: 'Order status updated.',
          color: 'bg-gray-500'
        };
    }
  };

  const sortedHistory = [...statusHistory].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Order Updates</h3>
      
      <div className="flow-root">
        <ul className="-mb-8">
          {sortedHistory.map((item, itemIdx) => {
            const statusInfo = getStatusInfo(item.status);
            const isLatest = itemIdx === 0;
            
            return (
              <li key={item.id}>
                <div className="relative pb-8">
                  {itemIdx !== sortedHistory.length - 1 ? (
                    <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                  ) : null}
                  
                  <div className="relative flex items-start space-x-3">
                    <div className={`relative px-1 ${isLatest ? 'animate-pulse' : ''}`}>
                      <div className={`h-8 w-8 ${statusInfo.color} rounded-full flex items-center justify-center ring-8 ring-white`}>
                        <span className="text-sm">{statusInfo.icon}</span>
                      </div>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${isLatest ? 'text-gray-900' : 'text-gray-600'}`}>
                            {statusInfo.title}
                          </p>
                          <p className={`text-sm ${isLatest ? 'text-gray-700' : 'text-gray-500'} mt-1`}>
                            {item.comment || statusInfo.description}
                          </p>
                        </div>
                        <div className="text-right whitespace-nowrap">
                          <time className={`text-sm ${isLatest ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                            {formatDateTime(item.created_at)}
                          </time>
                          {isLatest && (
                            <p className="text-xs text-blue-600 mt-1">Latest Update</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-8 pt-6 border-t">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Order Placed</span>
          <span>Delivered</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              currentStatus === 'delivered' ? 'bg-green-500' :
              currentStatus === 'shipped' || currentStatus === 'out_for_delivery' ? 'bg-purple-500' :
              currentStatus === 'processing' ? 'bg-indigo-500' :
              currentStatus === 'confirmed' ? 'bg-blue-500' :
              'bg-yellow-500'
            }`}
            style={{
              width: 
                currentStatus === 'delivered' ? '100%' :
                currentStatus === 'out_for_delivery' ? '90%' :
                currentStatus === 'shipped' ? '75%' :
                currentStatus === 'processing' ? '50%' :
                currentStatus === 'confirmed' ? '25%' :
                '10%'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
