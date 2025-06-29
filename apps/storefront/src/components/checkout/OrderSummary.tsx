'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@repo/utils';
import type { BackendCartData } from '@repo/types';

interface OrderSummaryProps {
 cartData: BackendCartData;
 shippingCost?: number;
}

export function OrderSummary({ cartData, shippingCost = 0 }: OrderSummaryProps) {
 const subtotal = cartData.totals.sub_total;
 const tax = cartData.totals.tax_amount;
 const total = subtotal + shippingCost + tax;

 return (
   <Card>
     <CardHeader>
       <CardTitle className="text-lg">Order Summary</CardTitle>
     </CardHeader>
     <CardContent className="space-y-4">
       {/* Items */}
       <div className="space-y-3">
         {cartData.items.map((item, index) => (
           <div key={`${item.product_id}-${index}`} className="flex justify-between text-sm">
             <div className="flex-1">
               <p className="font-medium text-gray-900">{item.product.name}</p>
               <p className="text-gray-500">Qty: {item.quantity}</p>
             </div>
             <p className="font-medium text-gray-900">
               {formatPrice(item.price * item.quantity)}
             </p>
           </div>
         ))}
       </div>

       <Separator />

       {/* Totals */}
       <div className="space-y-2">
         <div className="flex justify-between text-sm">
           <span className="text-gray-600">Subtotal</span>
           <span className="font-medium">{formatPrice(subtotal)}</span>
         </div>
         
         <div className="flex justify-between text-sm">
           <span className="text-gray-600">Shipping</span>
           <span className="font-medium">
             {shippingCost > 0 ? formatPrice(shippingCost) : 'Free'}
           </span>
         </div>
         
         <div className="flex justify-between text-sm">
           <span className="text-gray-600">Tax</span>
           <span className="font-medium">{formatPrice(tax)}</span>
         </div>
         
         <Separator />
         
         <div className="flex justify-between">
           <span className="text-base font-semibold text-gray-900">Total</span>
           <span className="text-xl font-bold text-gray-900">{formatPrice(total)}</span>
         </div>
       </div>

       {/* Item count */}
       <div className="bg-gray-50 rounded-lg p-3">
         <p className="text-sm text-gray-600 text-center">
           {cartData.totals.item_count} {cartData.totals.item_count === 1 ? 'item' : 'items'} in your cart
         </p>
       </div>
     </CardContent>
   </Card>
 );
}
