import { Plan } from "../models/plan.models.js";

// getAllPlans
export const getAllPlans = async (req, res) => {
    try {
        const plans = await Plan.find({ isActive: true }).sort({ price: 1 });
        res.status(200).json({
            success: true,
            plans
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// getPlaneById
export const getPlaneById = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await Plan.findById(id);
        
        if (!plan) {
            return res.status(404).json({ message: "Plan not found" });
        }
        
        res.status(200).json({
            success: true,
            plan
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// createPlane
export const createPlane = async (req, res) => {
    try {
        const { name, description, price, duration, features, storage_quota_mb, max_podcasts } = req.body;
        
        if (!name || !description || !price || !duration || !features || !storage_quota_mb) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }
        
        const existingPlan = await Plan.findOne({ name });
        if (existingPlan) {
            return res.status(400).json({ message: "Plan with this name already exists" });
        }
        
        const newPlan = new Plan({
            name,
            description,
            price,
            duration,
            features,
            storage_quota_mb: storage_quota_mb || 100,
            max_podcasts: max_podcasts || null
        });
        
        await newPlan.save();
        
        res.status(201).json({
            success: true,
            message: "Plan created successfully",
            plan: newPlan
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// updatePlane
export const updatePlane = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const plan = await Plan.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if (!plan) {
            return res.status(404).json({ message: "Plan not found" });
        }
        
        res.status(200).json({
            success: true,
            message: "Plan updated successfully",
            plan
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const deletePlan = async (req, res) => {
    try {
        const { id } = req.params;
        
        const plan = await Plan.findById(id);
        if (!plan) {
            return res.status(404).json({ message: "Plan not found" });
        }
        plan.isActive = false;
        await plan.save();
        
        res.status(200).json({
            success: true,
            message: "Plan deleted successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}