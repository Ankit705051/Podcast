import { Payment } from "../models/payments.models.js";
import { Subscription } from "../models/subscriptions.models.js";
import { Plan } from "../models/plan.models.js";

// createPayment (for subscription upgrades/new purchases)
export const createPayment = async (req, res) => {
    try {
        const { user_id, plan_id, amount, payment_gateway, payment_status, transactionId, payment_date, purpose, subscription_id, failure_reason, paidAt } = req.body;
        
        const payment = await Payment.create({
            user: user_id,
            plan: plan_id,
            amount,
            payment_gateway,
            payment_status,
            transactionId,
            payment_date,
            purpose,
            subscription_id,
            failure_reason,
            paidAt
        });
        
        res.status(201).json({
            success: true,
            message: "Payment created successfully",
            payment,
            transactionId: payment.transactionId
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// Process payment for subscription upgrade 
export const processSubscriptionPayment = async (req, res) => {
    try {
        const userId = req.user._id;
        const { planId, paymentMethod } = req.body;
        
        // Get plan details
        const plan = await Plan.findById(planId);
        if (!plan) {
            return res.status(404).json({ message: "Plan not found" });
        }
        
        // Get user's current subscription
        const currentSubscription = await Subscription.findOne({ user: userId });
        
        // Calculate proration if upgrading
        let finalAmount = plan.price;
        let refundAmount = 0;
        
        if (currentSubscription && currentSubscription.plan) {
            const currentPlan = await Plan.findById(currentSubscription.plan);
            const remainingDays = Math.ceil((currentSubscription.endDate - new Date()) / (1000 * 60 * 60 * 24));
            refundAmount = (currentPlan.price / 30) * remainingDays;
            finalAmount = Math.max(0, plan.price - refundAmount);
        }
        
        // Create payment record
        const payment = await Payment.create({
            user: userId,
            plan: planId,
            amount: finalAmount,
            payment_gateway: paymentMethod,
            payment_status: "pending",
            transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            payment_date: new Date(),
            purpose: currentSubscription ? "subscription_upgrade" : "new_subscription",
            subscription_id: currentSubscription?._id,
            paidAt: null
        });
        
        // Simulate payment processing (in real app, integrate with Stripe/Razorpay)
        setTimeout(async () => {
            try {
                // Update payment as completed
                await Payment.findByIdAndUpdate(payment._id, {
                    payment_status: "completed",
                    paidAt: new Date()
                });
                
                // Update or create subscription
                if (currentSubscription) {
                    await Subscription.findByIdAndUpdate(currentSubscription._id, {
                        plan: planId,
                        status: "active",
                        is_active: true,
                        endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
                        amount: plan.price
                    });
                } else {
                    await Subscription.create({
                        user: userId,
                        plan: planId,
                        status: "active",
                        is_active: true,
                        startDate: new Date(),
                        endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
                        amount: plan.price
                    });
                }
            } catch (error) {
                console.log("Payment processing error:", error);
                await Payment.findByIdAndUpdate(payment._id, {
                    payment_status: "failed",
                    failure_reason: "Payment processing failed"
                });
            }
        }, 2000); // Simulate 2-second payment processing
        
        res.status(200).json({
            success: true,
            message: "Payment initiated",
            payment: {
                transactionId: payment.transactionId,
                amount: finalAmount,
                planName: plan.name,
                refundAmount,
                finalAmount
            }
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error processing payment" });
    }
}

// Get payment status
export const getPaymentStatus = async (req, res) => {
    try {
        const { transactionId } = req.params;
        
        const payment = await Payment.findOne({ transactionId })
            .populate('user', 'userName email')
            .populate('plan', 'name price features');
        
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }
        
        res.status(200).json({
            success: true,
            payment: {
                transactionId: payment.transactionId,
                amount: payment.amount,
                status: payment.payment_status,
                plan: payment.plan,
                paymentDate: payment.payment_date,
                paidAt: payment.paidAt,
                failureReason: payment.failure_reason
            }
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error getting payment status" });
    }
}

// Get user payment history
export const getUserPaymentHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const payments = await Payment.find({ user: userId })
            .populate('plan', 'name price')
            .sort({ payment_date: -1 });
        
        res.status(200).json({
            success: true,
            payments,
            totalPayments: payments.length
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error getting payment history" });
    }
}

// Get all payments (Admin only)
export const getAllPayments = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        
        const filter = {};
        if (status) filter.payment_status = status;
        
        const payments = await Payment.find(filter)
            .populate('user', 'userName email')
            .populate('plan', 'name price')
            .sort({ payment_date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await Payment.countDocuments(filter);
        
        res.status(200).json({
            success: true,
            payments,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalPayments: total
            }
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error getting all payments" });
    }
}

// Get payment analytics (Admin dashboard)
export const getPaymentAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const dateFilter = {};
        if (startDate && endDate) {
            dateFilter.payment_date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        const totalRevenue = await Payment.aggregate([
            { $match: { payment_status: "completed", ...dateFilter } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        
        const paymentStats = await Payment.aggregate([
            { $match: dateFilter },
            { $group: { _id: "$payment_status", count: { $sum: 1 }, total: { $sum: "$amount" } } }
        ]);
        
        const planRevenue = await Payment.aggregate([
            { $match: { payment_status: "completed", ...dateFilter } },
            { $group: { _id: "$plan", count: { $sum: 1 }, revenue: { $sum: "$amount" } } },
            { $lookup: { from: "plans", localField: "_id", foreignField: "_id", as: "planInfo" } },
            { $unwind: "$planInfo" }
        ]);
        
        res.status(200).json({
            success: true,
            analytics: {
                totalRevenue: totalRevenue[0]?.total || 0,
                paymentStats,
                planRevenue,
                period: { startDate, endDate }
            }
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error getting payment analytics" });
    }
}