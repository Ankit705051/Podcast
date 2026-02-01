import express from "express";
import { getAllPlanes, getPlaneById, createPlane, updatePlane, deletePlane } from "../controllers/plans.controllers.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/role.middleware.js";

const router = express.Router();

// Public routes - anyone can view plans
router.get("/", getAllPlanes);
router.get("/:id", getPlaneById);

// Admin only routes - require authentication and admin role
router.post("/create", authenticateUser, checkRole("admin"), createPlane);
router.put("/update/:id", authenticateUser, checkRole("admin"), updatePlane);
router.delete("/delete/:id", authenticateUser, checkRole("admin"), deletePlane);

export default router;

