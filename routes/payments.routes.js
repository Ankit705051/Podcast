import express from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/role.middleware.js";
import {
    createPayment,
    processSubscriptionPayment,
    getPaymentStatus,
    getUserPaymentHistory,
    getAllPayments,
    getPaymentAnalytics
} from "../controllers/payments.controllers.js";

const router = express.Router();

// Public routes (for webhooks)
router.post("/webhook/stripe", express.raw({ type: 'application/json' }), (req, res) => {
    // This will be handled by stripe webhook controller
    res.json({ received: true });
});

// User routes (require authentication)
router.post("/create", authenticateUser, createPayment);
router.post("/process-subscription", authenticateUser, processSubscriptionPayment);
router.get("/status/:transactionId", authenticateUser, getPaymentStatus);
router.get("/history", authenticateUser, getUserPaymentHistory);

// Admin routes (require admin role)
router.get("/all", authenticateUser, checkRole("admin"), getAllPayments);
router.get("/analytics", authenticateUser, checkRole("admin"), getPaymentAnalytics);

export default router;