import { Plan } from "../models/plan.models.js";

// getAllPlanes
export const getAllPlans = async (req, res) => {
    try {
        const planes = await Plane.find({ isActive: true }).sort({ price: 1 });
        res.status(200).json({
            success: true,
            planes
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// getPlaneById
export const getPlanById = async (req, res) => {
    try {
        const { id } = req.params;
        const plane = await Plane.findById(id);
        
        if (!plan) {
            return res.status(404).json({ message: "Plan not found" });
        }
        
        res.status(200).json({
            success: true,
            plane
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// createPlane (Admin only)
export const createPlan = async (req, res) => {
    try {
        const { name, description, price, duration, features, storage_quota_mb, max_podcasts } = req.body;
        
        if (!name || !description || !price || !duration || !features || !storage_quota_mb) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }
        
        const existingPlane = await Plane.findOne({ name });
        if (existingPlane) {
            return res.status(400).json({ message: "Plan with this name already exists" });
        }
        
        const newPlane = new Plane({
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
            plane: newPlan
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// updatePlane
export const updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, duration, features, storage_quota_mb, max_podcasts, isActive } = req.body;
        
        const plane = await Plane.findById(id);
        if (!plane) {
            return res.status(404).json({ message: "Plan not found" });
        }
        if (name && name !== plane.name) {
            const existingPlane = await Plane.findOne({ name });
            if (existingPlane) {
                return res.status(400).json({ message: "Plan with this name already exists" });
            }
            plane.name = name;
        }
        
        if (description) plan.description = description;
        if (price !== undefined) plan.price = price;
        if (duration !== undefined) plan.duration = duration;
        if (features) plan.features = features;
        if (storage_quota_mb !== undefined) plan.storage_quota_mb = storage_quota_mb;
        if (max_podcasts !== undefined) plan.max_podcasts = max_podcasts;
        if (isActive !== undefined) plan.isActive = isActive;
        
        await plan.save();
        
        res.status(200).json({
            success: true,
            message: "Plan updated successfully",
            plane
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const deletePlan = async (req, res) => {
    try {
        const { id } = req.params;
        
        const plane = await Plane.findById(id);
        if (!plane) {
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