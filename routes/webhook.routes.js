import express from "express";
import { handleStripeWebhook } from "../controllers/stripe_webhook.controllers.js";

const router = express.Router();

// Stripe webhook endpoint
router.post("/stripe", express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
