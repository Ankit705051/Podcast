import express from "express";
import { getAllPlanes, getPlanById, createPlanes, updatePlanes, deletePlanes } from "../controllers/plans.controllers.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/role.middleware.js";

const router = express.Router();

// Public routes - anyone can view plans
router.get("/", getAllPlanes);
router.get("/:id", getPlanById);

// Admin only routes - require authentication and admin role
router.post("/", authenticateUser, checkRole("admin"), createPlanes);
router.put("/:id", authenticateUser, checkRole("admin"), updatePlanes);
router.delete("/:id", authenticateUser, checkRole("admin"), deletePlanes);

export default router;

