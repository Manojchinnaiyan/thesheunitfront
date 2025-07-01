// packages/api/payment.ts - NEW FILE following existing patterns

import { apiClient } from "./client";
import { API_ENDPOINTS } from "@repo/config";
import type { ApiResponse } from "@repo/types";

// Payment types
export interface PaymentInitiationResponse {
  razorpay_order_id: string;
  amount: number;
  currency: string;
  receipt: string;
  key_id: string;
  notes: Record<string, any>;
  order_details: {
    id: number;
    order_number: string;
    total_amount: number;
  };
}

export interface PaymentVerificationRequest {
  order_id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export class PaymentService {
  async initiatePayment(orderId: number): Promise<PaymentInitiationResponse> {
    try {
      console.log("Initiating payment for order:", orderId);
      const response = await apiClient.post<
        ApiResponse<PaymentInitiationResponse>
      >(API_ENDPOINTS.PAYMENT_INITIATE, { order_id: orderId });

      if (response.data) {
        return response.data;
      }

      throw new Error("Invalid payment initiation response");
    } catch (error) {
      console.error("Failed to initiate payment:", error);
      throw error;
    }
  }

  async verifyPayment(
    verificationData: PaymentVerificationRequest
  ): Promise<{ message: string }> {
    try {
      console.log("Verifying payment:", verificationData);
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.PAYMENT_VERIFY,
        verificationData
      );

      if (response.data || response.message) {
        return { message: response.message || "Payment verified successfully" };
      }

      throw new Error("Invalid payment verification response");
    } catch (error) {
      console.error("Failed to verify payment:", error);
      throw error;
    }
  }

  async handlePaymentFailure(
    orderId: number,
    reason?: string,
    code?: string
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.PAYMENT_FAILURE,
        {
          order_id: orderId,
          reason: reason || "Payment failed",
          code: code || "UNKNOWN",
        }
      );

      if (response.data || response.message) {
        return { message: response.message || "Payment failure recorded" };
      }

      throw new Error("Invalid payment failure response");
    } catch (error) {
      console.error("Failed to handle payment failure:", error);
      throw error;
    }
  }

  async getPaymentStatus(
    orderId: number
  ): Promise<{ status: string; payment_method?: string }> {
    try {
      const response = await apiClient.get<
        ApiResponse<{ status: string; payment_method?: string }>
      >(`${API_ENDPOINTS.PAYMENT_STATUS}/${orderId}`);

      if (response.data) {
        return response.data;
      }

      throw new Error("Invalid payment status response");
    } catch (error) {
      console.error("Failed to get payment status:", error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
