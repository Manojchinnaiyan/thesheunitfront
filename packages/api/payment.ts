import { apiClient } from './client';
import { API_ENDPOINTS } from '@repo/config';
import type { ApiResponse } from '@repo/types';

export interface PaymentInitiationRequest {
  order_id: number;
}

export interface PaymentInitiationResponse {
  razorpay_order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  receipt: string;
  notes: any;
  order_details: any;
}

export interface PaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  order_id: number;
}

export interface PaymentFailureRequest {
  order_id: number;
  reason: string;
  code: string;
  source: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  logo: string;
  enabled: boolean;
  key_id?: string;
  types: string[];
}

export class PaymentService {
  async initiatePayment(orderId: number): Promise<PaymentInitiationResponse> {
    try {
      console.log('Initiating payment for order:', orderId);
      const response = await apiClient.post<ApiResponse<PaymentInitiationResponse>>('/payment/initiate', {
        order_id: orderId
      });
      
      console.log('Payment initiation response:', response);
      
      if (response.data) {
        return response.data;
      }
      
      throw new Error('Invalid payment initiation response');
    } catch (error: any) {
      console.error('Failed to initiate payment:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to initiate payment');
    }
  }

  async verifyPayment(verificationData: PaymentVerificationRequest): Promise<any> {
    try {
      console.log('Verifying payment:', verificationData);
      const response = await apiClient.post<ApiResponse<any>>('/payment/verify', verificationData);
      
      console.log('Payment verification response:', response);
      
      if (response.data || response.message) {
        return response.data || response;
      }
      
      throw new Error('Invalid payment verification response');
    } catch (error: any) {
      console.error('Failed to verify payment:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to verify payment');
    }
  }

  async reportPaymentFailure(failureData: PaymentFailureRequest): Promise<any> {
    try {
      console.log('Reporting payment failure:', failureData);
      const response = await apiClient.post<ApiResponse<any>>('/payment/failure', failureData);
      
      if (response.data || response.message) {
        return response.data || response;
      }
      
      throw new Error('Invalid payment failure response');
    } catch (error: any) {
      console.error('Failed to report payment failure:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to report payment failure');
    }
  }

  async getPaymentStatus(orderId: number): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`/payment/status/${orderId}`);
      
      if (response.data) {
        return response.data;
      }
      
      throw new Error('Invalid payment status response');
    } catch (error: any) {
      console.error('Failed to get payment status:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to get payment status');
    }
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await apiClient.get<ApiResponse<PaymentMethod[]>>('/payment/methods');
      
      if (response.data) {
        return response.data;
      }
      
      throw new Error('Invalid payment methods response');
    } catch (error: any) {
      console.error('Failed to get payment methods:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to get payment methods');
    }
  }
}

export const paymentService = new PaymentService();
