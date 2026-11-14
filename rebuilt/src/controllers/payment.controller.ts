import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import {
  getPaymentHistory,
  getPaymentStatus,
  getAllPayments,
  createPayment,
  processSubscriptionPayment,
} from "../services/payment.service.js";
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
