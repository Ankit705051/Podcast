import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount_cents: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        required: true,
        uppercase: true,
        default: "USD",
        enum: ["USD", "EUR", "GBP", "INR"]
    },
    payment_gateway: {
        type: String,
        required: true,
        enum: ["stripe", "paypal", "razorpay", "square"]
    },
    payment_status: {
        type: String,
        required: true,
        enum: ["pending", "completed", "failed", "refunded", "cancelled"],
        default: "pending"
    },
    transactionId: {
        type: String,
        paidAt: Date,
        required: true,
        unique: true
    },
    payment_date: {
        type: Date,
        required: true,
        default: Date.now
    },
    purpose: {
        type: String,
        required: true,
        enum: ["subscription", "one_time", "upgrade", "renewal"],
        default: "subscription"
    },
    plan_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
        required: true
    },
    subscription_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription",
        default: null
    },
    failure_reason: {
        type: String,
        default: ""
    }
}, { timestamps: true });

export const Payment = mongoose.model("Payment", paymentSchema);