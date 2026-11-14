import { Router } from "express";
import authenticateUser from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createPlanSchema,
  updatePlanSchema,
} from "../validation/plan.validation.js";
import {
  getAllPlansController,
  getPlanByIdController,
  createPlanController,
  updatePlanController,
  deletePlanController,
} from "../controllers/plan.controller.js";

const router = Router();

// Public routes - anyone can view plans
router.get("/", getAllPlansController);
router.get("/:id", getPlanByIdController);

// Admin only routes
router.post(
  "/",
  authenticateUser,
  authorizeRoles("admin"),
  validate(createPlanSchema, "body"),
  createPlanController
);
router.put(
  "/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(updatePlanSchema, "body"),
  updatePlanController
);
router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("admin"),
  deletePlanController
);

export default router;
