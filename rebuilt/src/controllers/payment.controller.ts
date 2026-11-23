import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import {
  getPaymentHistory,
  getPaymentStatus,
  getAllPayments,
  createPayment,
  processSubscriptionPayment,
  createStripeCheckoutForPlan,
  fulfillStripePayment,
} from "../services/payment.service.js";
import { constructStripeEvent } from "../services/stripe.service.js";
import type Stripe from "stripe";
import type { JwtUser } from "../types/auth.js";
import type {
  CreatePaymentInput,
  ProcessSubscriptionPaymentInput,
} from "../validation/payment.validation.js";

const requester = (req: Request): JwtUser => req.user as JwtUser;

export const getPaymentHistoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const payments = await getPaymentHistory(requester(req).id);
    return res.status(200).json({ success: true, payments });
  }
);

export const getPaymentStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const { transactionId } = req.params;
    const result = await getPaymentStatus(transactionId as string, requester(req));
    return res.status(200).json({
      success: true,
      payment: result.payment,
      transactionStatus: result.transactionStatus,
    });
  }
);

export const getAllPaymentsController = asyncHandler(
  async (_req: Request, res: Response) => {
    const payments = await getAllPayments();
    return res.status(200).json({ success: true, payments });
  }
);

export const createPaymentController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await createPayment(
      requester(req).id,
      req.body as CreatePaymentInput
    );
    return res.status(201).json({
      success: true,
      transactionId: result.transactionId,
      payment: result.payment,
      message: "Payment transaction created",
    });
  }
);

export const processSubscriptionPaymentController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await processSubscriptionPayment(
      requester(req).id,
      req.body as ProcessSubscriptionPaymentInput
    );
    return res.status(200).json({
      success: true,
      transactionId: result.transactionId,
      status: result.status,
      payment: result.payment,
      subscription: result.subscription,
      message:
        result.subscription !== null
          ? "Payment completed and subscription activated"
          : "Payment transaction created. Complete payment to activate subscription.",
    });
  }
);

// Stripe checkout session for a paid plan — returns the hosted checkout URL.
export const createStripeCheckoutController = asyncHandler(
  async (req: Request, res: Response) => {
    const { planId } = req.body as { planId: string };
    const result = await createStripeCheckoutForPlan(requester(req).id, planId);
    return res.status(200).json({
      success: true,
      url: result.url,
      sessionId: result.sessionId,
      paymentId: result.paymentId,
      amount: result.amount,
      planName: result.planName,
    });
  }
);

// Stripe webhook — mounted with express.raw() in index.ts so the signature
// can be verified against the raw request body.
export const stripeWebhookController = asyncHandler(
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string | undefined;
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(JSON.stringify(req.body ?? {}));

    let event: Stripe.Event;
    try {
      event = constructStripeEvent(rawBody, signature ?? "");
    } catch (error) {
      console.error("Stripe webhook verification failed:", error);
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await fulfillStripePayment(session);
    }

    return res.status(200).json({ received: true });
  }
);
