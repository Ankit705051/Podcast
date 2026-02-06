import express from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/role.middleware.js";
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
    upgradeSubscription
} from "../controllers/subscriptions.controllers.js";

const router = express.Router();

// Public routes
router.post("/createFreeSubscription/:userId", createFreeSubscription);

// User routes (require authentication)
router.get("/getUserSubscription", authenticateUser, getUserSubscription);
router.get("/getSubscriptionById/:subscriptionId", authenticateUser, getSubscriptionById);
router.put("/updateSubscription/:subscriptionId", authenticateUser, updateSubscription);
router.put("/cancelSubscription/:subscriptionId", authenticateUser, cancelSubscription);
router.put("/renewSubscription/:subscriptionId", authenticateUser, renewSubscription);
router.put("/activateSubscription/:subscriptionId", authenticateUser, activateSubscription);
router.put("/deactivateSubscription/:subscriptionId", authenticateUser, deactivateSubscription);
router.put("/upgradeSubscription", authenticateUser, upgradeSubscription);

// Admin routes (require admin role)
router.get("/getAllSubscriptions", authenticateUser, checkRole("admin"), getAllSubscriptions);

export default router;