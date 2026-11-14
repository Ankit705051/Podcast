import { Router } from "express";
import authenticateUser from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  checkoutSessionSchema,
  renewSubscriptionSchema,
  upgradeSubscriptionSchema,
  updateSubscriptionSchema,
} from "../validation/subscription.validation.js";
import {
  createFreeSubscriptionController,
  createCheckoutSessionController,
  getUserSubscriptionController,
  getAllSubscriptionsController,
  getSubscriptionByIdController,
  updateSubscriptionController,
  cancelSubscriptionController,
  renewSubscriptionController,
  activateSubscriptionController,
  deactivateSubscriptionController,
  upgradeSubscriptionController,
} from "../controllers/subscription.controller.js";

const router = Router();

// Public route (legacy behaviour)
router.post(
  "/createFreeSubscription/:userId",
  createFreeSubscriptionController
);

// Authenticated user routes
router.post(
  "/create-checkout-session",
  authenticateUser,
  validate(checkoutSessionSchema, "body"),
  createCheckoutSessionController
);
router.get("/getUserSubscription", authenticateUser, getUserSubscriptionController);
router.get(
  "/getSubscriptionById/:subscriptionId",
  authenticateUser,
  getSubscriptionByIdController
);
router.put(
  "/updateSubscription/:subscriptionId",
  authenticateUser,
  validate(updateSubscriptionSchema, "body"),
  updateSubscriptionController
);
router.put(
  "/cancelSubscription/:subscriptionId",
  authenticateUser,
  cancelSubscriptionController
);
router.put(
  "/renewSubscription/:subscriptionId",
  authenticateUser,
  validate(renewSubscriptionSchema, "body"),
  renewSubscriptionController
);
router.put(
  "/activateSubscription/:subscriptionId",
  authenticateUser,
  activateSubscriptionController
);
router.put(
  "/deactivateSubscription/:subscriptionId",
  authenticateUser,
  deactivateSubscriptionController
);
router.put(
  "/upgradeSubscription",
  authenticateUser,
  validate(upgradeSubscriptionSchema, "body"),
  upgradeSubscriptionController
);

// Admin route
router.get(
  "/getAllSubscriptions",
  authenticateUser,
  authorizeRoles("admin"),
  getAllSubscriptionsController
);

export default router;
