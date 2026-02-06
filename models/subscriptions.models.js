import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ["active", "expired", "cancelled", "pending"],
        default: "pending",
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    endDate: {
        type: Date,
        required: true,
    },
    is_active: {
        type: Boolean,
        required: true,
        default: true,
    },
    autoRenew: {
        type: Boolean,
        required: true,
        default: true,
    },
    expiry_message: {
        type: String,
        default: "",
    },
    paymentId: {
        type: String,
        default: null,
    },
    amount: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true,
});

export const Subscription = mongoose.model("Subscription", subscriptionSchema);