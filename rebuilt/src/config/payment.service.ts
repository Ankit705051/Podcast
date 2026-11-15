import "dotenv/config";
import { AppError } from "../utils/AppError.js";

const PAYMENT_SERVICE_URL =
  process.env.PAYMENT_SERVICE_URL || "http://localhost:3002";
const PAYMENT_MOCK = process.env.PAYMENT_SERVICE_MOCK === "true";
export interface PaymentTransactionRequest {
  userId: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentServiceResponse {
  success?: boolean;
  transactionId?: string;
  subscriptionId?: string;
  status?: string;
  [key: string]: unknown;
}

const request = async <T extends PaymentServiceResponse>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> => {
  if (PAYMENT_MOCK) {
    if (path === "/transactions" && options.method === "POST") {
      return {
        success: true,
        transactionId: `mock_txn_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        status: "paid",
      } as T;
    }
    if (path.startsWith("/transactions/")) {
      return { success: true, status: "paid" } as T;
    }
    return { success: true, status: "active" } as T;
  }

  let response: Response;
  try {
    response = await fetch(`${PAYMENT_SERVICE_URL}${path}`, {
      method: options.method ?? "GET",
      headers: { "Content-Type": "application/json" },
      ...(options.body !== undefined
        ? { body: JSON.stringify(options.body) }
        : {}),
    });
  } catch (error) {
    console.error(`Payment service request failed (${path}):`, error);
    throw new AppError("Payment service is unreachable", 502, "PAYMENT_SERVICE_DOWN");
  }

  if (!response.ok) {
    throw new AppError(
      `Payment service returned ${response.status}`,
      502,
      "PAYMENT_SERVICE_ERROR"
    );
  }

  return (await response.json()) as T;
};

// Create payment transaction  -> POST /transactions
export const createPaymentTransaction = (
  data: PaymentTransactionRequest
): Promise<PaymentServiceResponse> =>
  request("/transactions", { method: "POST", body: data });

// Get transaction status -> GET /transactions/:transactionId
export const getTransactionStatus = (
  transactionId: string
): Promise<PaymentServiceResponse> =>
  request(`/transactions/${encodeURIComponent(transactionId)}`);

// Refund transaction -> POST /transactions/:transactionId/refund
export const refundTransaction = (
  transactionId: string,
  reason?: string
): Promise<PaymentServiceResponse> =>
  request(`/transactions/${encodeURIComponent(transactionId)}/refund`, {
    method: "POST",
    body: reason ? { reason } : {},
  });

export interface PaymentServiceSubscriptionRequest {
  userId: string;
  planId?: string;
  amount?: number;
  interval?: string;
  metadata?: Record<string, unknown>;
}

// Create subscription -> POST /subscriptions
export const createSubscription = (
  data: PaymentServiceSubscriptionRequest
): Promise<PaymentServiceResponse> =>
  request("/subscriptions", { method: "POST", body: data });

// Get subscription -> GET /subscriptions/:subscriptionId
export const getSubscription = (
  subscriptionId: string
): Promise<PaymentServiceResponse> =>
  request(`/subscriptions/${encodeURIComponent(subscriptionId)}`);

// Get user subscriptions -> GET /users/:userId/subscriptions
export const getUserSubscriptions = (
  userId: string
): Promise<PaymentServiceResponse> =>
  request(`/users/${encodeURIComponent(userId)}/subscriptions`);

// Cancel subscription -> POST /subscriptions/:subscriptionId/cancel
export const cancelSubscription = (
  subscriptionId: string
): Promise<PaymentServiceResponse> =>
  request(`/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
    method: "POST",
    body: {},
  });

export default {
  createPaymentTransaction,
  getTransactionStatus,
  refundTransaction,
  createSubscription,
  getSubscription,
  getUserSubscriptions,
  cancelSubscription,
};
