import { Subscription } from "../models/subscriptions.models.js";
import { Plan } from "../models/plan.models.js";
import { Payment } from "../models/payments.models.js";
import {stripe} from "../config/stripe.js";

// create free subscription
export const createFreeSubscription = async (req, res) => {
    try {
        const { userId } = req.params;
        const freeplane = await Plan.findOne({ name: "Free" });
        if (!freeplane) {
            return res.status(404).json({ message: "Free plan not found" });
        }
        
        // Check if user already has a subscription
        const existingSubscription = await Subscription.findOne({ user: userId });
        if (existingSubscription) {
            return res.status(400).json({ message: "User already has a subscription" });
        }
        
        const subscription = await Subscription.create({
            user: userId,
            plan: freeplane._id,
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            status: "active",
            is_active: true,
            amount: 0
        });
        
        res.status(201).json({
            success: true,
            message: "Free subscription created successfully",
            subscription
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating free subscription" });
    }
}

// get user subscription
export const getUserSubscription = async (req, res) => {
    try {
        const userId = req.user._id;
        const subscription = await Subscription.findOne({ user: userId }).populate('plan');
        
        if (!subscription) {
            return res.status(404).json({ message: "No subscription found" });
        }
        
        res.status(200).json({
            success: true,
            subscription
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error getting user subscription" });
    }
}

// get all subscriptions
export const getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find().populate('user plan');
        res.status(200).json({
            success: true,
            subscriptions
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error getting all subscriptions" });
    }
}

// get subscription by id
export const getSubscriptionById = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const subscription = await Subscription.findById(subscriptionId).populate('user plan');
        
        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }
        
        res.status(200).json({
            success: true,
            subscription
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error getting subscription" });
    }
}

// update subscription
export const updateSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const updateData = req.body;
        
        const subscription = await Subscription.findByIdAndUpdate(
            subscriptionId, 
            updateData, 
            { new: true, runValidators: true }
        ).populate('plan');
        
        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }
        
        res.status(200).json({
            success: true,
            message: "Subscription updated successfully",
            subscription
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating subscription" });
    }
}

// cancel subscription (with Stripe integration)
export const cancelSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
          return res.status(404).json({ message: "Subscription not found" });
        }
        
        // Cancel in Stripe if it's a paid subscription
        if (subscription.stripe_subscription_id) {
            try {
                await stripe.subscriptions.del(subscription.stripe_subscription_id);
            } catch (stripeError) {
                console.log("Stripe cancellation error:", stripeError.message);
            }
        }
        
        // Update local subscription
        const updatedSubscription = await Subscription.findByIdAndUpdate(
            subscriptionId, 
            { 
                status: "cancelled",
                is_active: false,
                autoRenew: false
            }, 
            { new: true }
        ).populate('plan');
        
        res.status(200).json({
            success: true,
            message: "Subscription cancelled successfully",
            subscription: updatedSubscription
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error cancelling subscription" });
    }
}

// renew subscription
export const renewSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const { newEndDate } = req.body;
        
        const subscription = await Subscription.findByIdAndUpdate(
            subscriptionId, 
            { 
                status: "active",
                is_active: true,
                endDate: newEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }, 
            { new: true }
        ).populate('plan');
        
        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }
        
        res.status(200).json({
            success: true,
            message: "Subscription renewed successfully",
            subscription
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error renewing subscription" });
    }
}

// activate subscription
export const activateSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const subscription = await Subscription.findByIdAndUpdate(
            subscriptionId, 
            { 
                status: "active",
                is_active: true
            }, 
            { new: true }
        ).populate('plan');
        
        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }
        
        res.status(200).json({
            success: true,
            message: "Subscription activated successfully",
            subscription
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error activating subscription" });
    }
}

// deactivate subscription
export const deactivateSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const subscription = await Subscription.findByIdAndUpdate(
            subscriptionId, 
            { 
                status: "expired",
                is_active: false
            }, 
            { new: true }
        ).populate('plan');
        
        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }
        
        res.status(200).json({
            success: true,
            message: "Subscription deactivated successfully",
            subscription
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deactivating subscription" });
    }
}

// upgrade subscription (with Stripe integration)
export const upgradeSubscription = async (req, res) => {
    try {
        const userId = req.user._id;
        const { newPlanId } = req.body;
        
        const newPlan = await Plan.findById(newPlanId);
        if (!newPlan) {
            return res.status(404).json({ message: "Plan not found" });
        }
        
        // Get existing subscription
        const existingSubscription = await Subscription.findOne({ user: userId });
        if (!existingSubscription) {
            return res.status(404).json({ message: "No existing subscription found" });
        }
        
        // Calculate proration
        let finalAmount = newPlan.price;
        let refundAmount = 0;
        
        if (existingSubscription.plan) {
            const currentPlan = await Plan.findById(existingSubscription.plan);
            const remainingDays = Math.ceil((existingSubscription.endDate - new Date()) / (1000 * 60 * 60 * 24));
            refundAmount = (currentPlan.price / 30) * remainingDays;
            finalAmount = Math.max(0, newPlan.price - refundAmount);
        }
        
        // Create payment record
        const payment = await Payment.create({
            user: userId,
            plan: newPlanId,
            amount: finalAmount,
            payment_gateway: 'stripe',
            payment_status: 'pending',
            transactionId: `upgrade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            payment_date: new Date(),
            purpose: 'subscription_upgrade',
            subscription_id: existingSubscription._id
        });
        
        // Update subscription (will be activated by webhook)
        const subscription = await Subscription.findByIdAndUpdate(
            existingSubscription._id,
            { 
                plan: newPlanId,
                status: 'pending_payment',
                amount: newPlan.price
            },
            { new: true }
        ).populate('plan');
        
        res.status(200).json({
            success: true,
            message: "Subscription upgrade initiated",
            subscription,
            payment: {
                transactionId: payment.transactionId,
                amount: finalAmount,
                refundAmount,
                planName: newPlan.name
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error upgrading subscription" });
    }
}

// Create Stripe checkout session for subscription
export const createStripeCheckoutSession = async (req, res) => {
    try {
        const userId = req.user._id;
        const { planId } = req.body;
        
        const plan = await Plan.findById(planId);
        if (!plan) {
            return res.status(404).json({ message: "Plan not found" });
        }
        
        // Get or create Stripe customer
        const { User } = await import("../models/users.models.js");
        const user = await User.findById(userId);
        
        let stripeCustomerId = user.stripe_customer_id;
        
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: { userId: user._id.toString() }
            });
            
            stripeCustomerId = customer.id;
            user.stripe_customer_id = stripeCustomerId;
            await user.save();
        }
        
        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: plan.name,
                        description: plan.description,
                    },
                    unit_amount: Math.round(plan.price * 100), // Convert to cents
                    recurring: {
                        interval: 'month',
                    },
                },
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URI}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URI}/payment/cancel`,
            metadata: {
                userId: userId,
                planId: planId
            }
        });
        
        res.status(200).json({
            success: true,
            sessionId: session.id,
            url: session.url
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating checkout session" });
    }
}



