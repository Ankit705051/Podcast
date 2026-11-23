import { Router } from "express";
import authenticateUser from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createPaymentSchema,
  processSubscriptionPaymentSchema,
} from "../validation/payment.validation.js";
import {
  getPaymentHistoryController,
  getPaymentStatusController,
  getAllPaymentsController,
  createPaymentController,
  processSubscriptionPaymentController,
  createStripeCheckoutController,
} from "../controllers/payment.controller.js";

const router = Router();

// Authenticated user routes
router.get("/history", authenticateUser, getPaymentHistoryController);
router.get("/status/:transactionId", authenticateUser, getPaymentStatusController);
router.post(
  "/create",
  authenticateUser,
  validate(createPaymentSchema, "body"),
  createPaymentController
);
router.post(
  "/process-subscription",
  authenticateUser,
  validate(processSubscriptionPaymentSchema, "body"),
  processSubscriptionPaymentController
);
// Stripe hosted checkout — returns { url } for the frontend to redirect to.
router.post(
  "/checkout",
  authenticateUser,
  validate(processSubscriptionPaymentSchema, "body"),
  createStripeCheckoutController
);

// Admin route
router.get(
  "/all",
  authenticateUser,
  authorizeRoles("admin"),
  getAllPaymentsController
);

export default router;
