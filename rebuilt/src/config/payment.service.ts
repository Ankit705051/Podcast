import "dotenv/config";
import { AppError } from "../utils/AppError.js";

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || "http://localhost:3002";
const PAYMENT_SERVICE_API_KEY = process.env.PAYMENT_SERVICE_API_KEY;
const PAYMENT_MOCK = process.env.PAYMENT_SERVICE_MOCK === "true";
const PAYMENT_TIMEOUT_MS = Number(process.env.PAYMENT_SERVICE_TIMEOUT ?? 5000);

export type NormalizedPaymentStatus =  | "INITIATED" | "PROCESSING" | "SUCCEEDED"| "FAILED"| "REFUNDED";
export type SubscriptionStatus =| "INITIATED"| "ACTIVE"| "CANCELLED" | "PAST_DUE"| "FAILED";
export type PaymentGateway =| "STRIPE" | "RAZORPAY"| "PAYPAL";


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
  status?: NormalizedPaymentStatus | SubscriptionStatus;
  gateway?:PaymentGateway;
  message?: string;
  error?: string;
  [key: string]: unknown;
}

interface RequestOptions {
    method?: string;
    body?: unknown;
    idempotencyKey?: string;
} 

const validateConfig = () => {
    if(PAYMENT_MOCK && process.env.NODE_ENV === "production") {
        throw new Error("Payment mock is enabled in production environment");
    }
    if(!PAYMENT_MOCK && !PAYMENT_SERVICE_URL) {
        throw new Error("Payment service URL is not configured");
    }
    if (!PAYMENT_MOCK && !PAYMENT_SERVICE_API_KEY) {
       throw new Error("PAYMENT_SERVICE_API_KEY is required");
    } 
    if(!Number.isFinite(Number(process.env.PAYMENT_SERVICE_TIMEOUT))) {
        throw new Error("PAYMENT_SERVICE_TIMEOUT is not configured or invalid");
    }
};

const mockResponse = (
  path: string,
  options: RequestOptions
): PaymentServiceResponse => {
  if (path === "/transactions" && options.method === "POST") {
    return {
      success: true,
      transactionId: `mock_txn_${Date.now()}`,
      status: "SUCCEEDED",
    };
  }

  if (path.startsWith("/transactions/")) {
    return {
      success: true,
      status: "SUCCEEDED",
    };
  }

  if (path === "/subscriptions") {
    return {
      success: true,
      subscriptionId: `mock_sub_${Date.now()}`,
      status: "ACTIVE",
    };
  }

  return {
    success: true,
    status: "ACTIVE",
  };
};

const request = async <T extends PaymentServiceResponse>(
  path: string,
  options: RequestOptions = {}
): Promise<T> => {
  validateConfig();

  if (PAYMENT_MOCK) {
    return mockResponse(path, options) as T;
  }

  const url = new URL(path, PAYMENT_SERVICE_URL!).toString();

  let response: Response;

  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PAYMENT_SERVICE_API_KEY}`,
        ...(options.idempotencyKey
          ? { "Idempotency-Key": options.idempotencyKey }
          : {}),
      },
      ...(options.body !== undefined
        ? { body: JSON.stringify(options.body) }
        : {}),
      signal: AbortSignal.timeout(PAYMENT_TIMEOUT_MS),
    });
  } catch (error) {
    const isTimeout =
      error instanceof Error && error.name === "TimeoutError";

    throw new AppError(
      isTimeout
        ? "Payment service request timed out"
        : "Payment service is unreachable",
      502,
      isTimeout
        ? "PAYMENT_SERVICE_TIMEOUT"
        : "PAYMENT_SERVICE_DOWN"
    );
  }

  const responseText = await response.text();

  let data: unknown;

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new AppError(
      "Invalid response from payment service",
      502,
      "INVALID_PAYMENT_SERVICE_RESPONSE"
    );
  }

  if (!response.ok) {
    throw new AppError(
      "Payment service request failed",
      502,
      "PAYMENT_SERVICE_ERROR"
    );
  }

  if (
    typeof data !== "object" ||
    data === null ||
    Array.isArray(data)
  ) {
    throw new AppError(
      "Invalid response from payment service",
      502,
      "INVALID_PAYMENT_SERVICE_RESPONSE"
    );
  }

  return data as T;
};

// Create payment transaction  -> POST /transactions
export const createPaymentTransaction = (
  data: PaymentTransactionRequest,
  idempotencyKey?: string
): Promise<PaymentServiceResponse> =>
  request("/transactions", {
    method: "POST",
    body: data,
    ...(idempotencyKey !== undefined ? { idempotencyKey } : {}),
  });

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
