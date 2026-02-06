import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    duration: {
        type: Number,
        required: true,
        min: 1
    },
    features: {
        type: [String],
        required: true
    },
    storage_quota_mb: {
        type: Number,
        required: true,
        default: 100
    },
    max_podcasts: {
        type: Number,
        default: null 
    },
    isActive: {
        type: Boolean,
        default: true
    },
    stripe_price_id: {
        type: String,
        default: null 
    }
}, { timestamps: true });

export const Plan = mongoose.model("Plan", planSchema);