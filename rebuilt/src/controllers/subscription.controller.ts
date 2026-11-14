import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createFreeSubscription,
  getUserSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscription,
  cancelSubscription,
  renewSubscription,
  activateSubscription,
  deactivateSubscription,
  upgradeSubscription,
  createCheckoutSession,
} from "../services/subscription.service.js";
import type { JwtUser } from "../types/auth.js";
import type {
  CheckoutSessionInput,
  RenewSubscriptionInput,
  UpgradeSubscriptionInput,
  UpdateSubscriptionInput,
} from "../validation/subscription.validation.js";

const requester = (req: Request): JwtUser => req.user as JwtUser;

export const createFreeSubscriptionController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const subscription = await createFreeSubscription(userId as string);
    return res.status(201).json({
      success: true,
      message: "Free subscription created successfully",
      subscription,
    });
  }
);

export const createCheckoutSessionController = asyncHandler(
  async (req: Request, res: Response) => {
    const { planId } = req.body as CheckoutSessionInput;
    const result = await createCheckoutSession(requester(req).id, planId);
    return res.status(200).json({
      success: true,
      transactionId: result.transactionId,
      amount: result.amount,
      planName: result.planName,
      message:
        "Payment transaction created. Complete payment to activate subscription.",
    });
  }
);

export const getUserSubscriptionController = asyncHandler(
  async (req: Request, res: Response) => {
    const subscription = await getUserSubscription(requester(req).id);
    return res.status(200).json({ success: true, subscription });
  }
);

export const getAllSubscriptionsController = asyncHandler(
  async (_req: Request, res: Response) => {
    const subscriptions = await getAllSubscriptions();
    return res.status(200).json({ success: true, subscriptions });
  }
);

export const getSubscriptionByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { subscriptionId } = req.params;
    const subscription = await getSubscriptionById(
      subscriptionId as string,
      requester(req)
    );
    return res.status(200).json({ success: true, subscription });
  }
);

export const updateSubscriptionController = asyncHandler(
  async (req: Request, res: Response) => {
    const { subscriptionId } = req.params;
    const subscription = await updateSubscription(
      subscriptionId as string,
      req.body as UpdateSubscriptionInput,
      requester(req)
    );
    return res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      subscription,
    });
  }
);

export const cancelSubscriptionController = asyncHandler(
  async (req: Request, res: Response) => {
    const { subscriptionId } = req.params;
    const subscription = await cancelSubscription(
      subscriptionId as string,
      requester(req)
    );
    return res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      subscription,
    });
  }
);

export const renewSubscriptionController = asyncHandler(
  async (req: Request, res: Response) => {
    const { subscriptionId } = req.params;
    const { newEndDate } = req.body as RenewSubscriptionInput;
    const subscription = await renewSubscription(
      subscriptionId as string,
      requester(req),
      newEndDate
    );
    return res.status(200).json({
      success: true,
      message: "Subscription renewed successfully",
      subscription,
    });
  }
);

export const activateSubscriptionController = asyncHandler(
  async (req: Request, res: Response) => {
    const { subscriptionId } = req.params;
    const subscription = await activateSubscription(
      subscriptionId as string,
      requester(req)
    );
    return res.status(200).json({
      success: true,
      message: "Subscription activated successfully",
      subscription,
    });
  }
);

export const deactivateSubscriptionController = asyncHandler(
  async (req: Request, res: Response) => {
    const { subscriptionId } = req.params;
    const subscription = await deactivateSubscription(
      subscriptionId as string,
      requester(req)
    );
    return res.status(200).json({
      success: true,
      message: "Subscription deactivated successfully",
      subscription,
    });
  }
);

export const upgradeSubscriptionController = asyncHandler(
  async (req: Request, res: Response) => {
    const { newPlanId } = req.body as UpgradeSubscriptionInput;
    const result = await upgradeSubscription(requester(req).id, newPlanId);
    return res.status(200).json({
      success: true,
      message: "Subscription upgrade initiated",
      subscription: result.subscription,
      payment: result.payment,
    });
  }
);
