'use client';

import { formatDateTime } from '@/lib/utils';

interface StatusHistoryItem {
  id: number;
  status: string;
  comment: string;
  created_at: string;
  created_by: number;
}

interface OrderStatusTimelineProps {
  statusHistory: StatusHistoryItem[];
  currentStatus: string;
}

export function OrderStatusTimeline({ statusHistory, currentStatus }: OrderStatusTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return (
          <div className="bg-yellow-500 w-3 h-3 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        );
      case 'confirmed':
        return (
          <div className="bg-blue-500 w-3 h-3 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'processing':
        return (
          <div className="bg-indigo-500 w-3 h-3 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          </div>
        );
      case 'shipped':
        return (
          <div className="bg-purple-500 w-3 h-3 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3z" />
              <path d="M14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
            </svg>
          </div>
        );
      case 'delivered':
        return (
          <div className="bg-green-500 w-3 h-3 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'cancelled':
        return (
          <div className="bg-red-500 w-3 h-3 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-400 w-3 h-3 rounded-full"></div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Order Timeline</h3>
      
      <div className="flow-root">
        <ul className="-mb-8">
          {statusHistory.map((item, itemIdx) => (
            <li key={item.id}>
              <div className="relative pb-8">
                {itemIdx !== statusHistory.length - 1 ? (
                  <span className="absolute top-4 left-1.5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                ) : null}
                
                <div className="relative flex space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center">
                    {getStatusIcon(item.status)}
                  </div>
                  
                  <div className="flex min-w-0 flex-1 justify-between space-x-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {item.status.replace('_', ' ')}
                      </p>
                      {item.comment && (
                        <p className="text-sm text-gray-500 mt-1">
                          {item.comment}
                        </p>
                      )}
                    </div>
                    
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      <time>{formatDateTime(item.created_at)}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
