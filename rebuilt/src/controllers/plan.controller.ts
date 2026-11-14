import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
} from "../services/plan.service.js";
import type { CreatePlanInput, UpdatePlanInput } from "../validation/plan.validation.js";

export const getAllPlansController = asyncHandler(
  async (_req: Request, res: Response) => {
    const plans = await getAllPlans();
    return res.status(200).json({ success: true, plans });
  }
);

export const getPlanByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const plan = await getPlanById(req.params.id as string);
    return res.status(200).json({ success: true, plan });
  }
);

export const createPlanController = asyncHandler(
  async (req: Request, res: Response) => {
    const plan = await createPlan(req.body as CreatePlanInput);
    return res.status(201).json({
      success: true,
      message: "Plan created successfully",
      plan,
    });
  }
);

export const updatePlanController = asyncHandler(
  async (req: Request, res: Response) => {
    const plan = await updatePlan(
      req.params.id as string,
      req.body as UpdatePlanInput
    );
    return res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      plan,
    });
  }
);

export const deletePlanController = asyncHandler(
  async (req: Request, res: Response) => {
    await deletePlan(req.params.id as string);
    return res.status(200).json({
      success: true,
      message: "Plan deleted successfully",
    });
  }
);
