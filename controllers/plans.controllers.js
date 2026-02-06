import { Plan } from "../models/plan.models.js";

// getAllPlanes
export const getAllPlanes = async (req, res) => {
    try {
        const planes = await Plan.find({ isActive: true }).sort({ price: 1 });
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
export const getPlaneById = async (req, res) => {
    try {
        const { id } = req.params;
        const plane = await Plan.findById(id);
        
        if (!plane) {
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
export const createPlane = async (req, res) => {
    try {
        const { name, description, price, duration, features, storage_quota_mb, max_podcasts } = req.body;
        
        if (!name || !description || !price || !duration || !features || !storage_quota_mb) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }
        
        const existingPlane = await Plan.findOne({ name });
        if (existingPlane) {
            return res.status(400).json({ message: "Plan with this name already exists" });
        }
        
        const newPlane = new Plan({
            name,
            description,
            price,
            duration,
            features,
            storage_quota_mb: storage_quota_mb || 100,
            max_podcasts: max_podcasts || null
        });
        
        await newPlane.save();
        
        res.status(201).json({
            success: true,
            message: "Plan created successfully",
            plane: newPlane
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
        const { name, description, price, duration, features, storage_quota_mb, max_podcasts, isActive } = req.body;
        
        const plane = await Plan.findById(id);
        if (!plane) {
            return res.status(404).json({ message: "Plan not found" });
        }
        if (name && name !== plane.name) {
            const existingPlane = await Plan.findOne({ name });
            if (existingPlane) {
                return res.status(400).json({ message: "Plan with this name already exists" });
            }
            plane.name = name;
        }
        
        if (description) plane.description = description;
        if (price !== undefined) plane.price = price;
        if (duration !== undefined) plane.duration = duration;
        if (features) plane.features = features;
        if (storage_quota_mb !== undefined) plane.storage_quota_mb = storage_quota_mb;
        if (max_podcasts !== undefined) plane.max_podcasts = max_podcasts;
        if (isActive !== undefined) plane.isActive = isActive;
        
        await plane.save();
        
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

export const deletePlane = async (req, res) => {
    try {
        const { id } = req.params;
        
        const plane = await Plan.findById(id);
        if (!plane) {
            return res.status(404).json({ message: "Plan not found" });
        }
        plane.isActive = false;
        await plane.save();
        
        res.status(200).json({
            success: true,
            message: "Plan deleted successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}