import stripe from '../config/stripe.js';
import { Payment } from '../models/payments.models.js';
import { Subscription } from '../models/subscriptions.models.js';
import { Plan } from '../models/plan.models.js';

export const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        
        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed':
                await handlePaymentSuccess(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await handleRecurringPaymentSuccess(event.data.object);
                break;
            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionCancelled(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await handlePaymentIntentFailed(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        
        res.json({ received: true });
    } catch (err) {
        console.error('Webhook error:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};

// Handle successful payment
async function handlePaymentSuccess(session) {
    try {
        console.log('Payment completed:', session.id);
        
        // Update payment record
        await Payment.findOneAndUpdate(
            { transactionId: session.payment_intent },
            {
                payment_status: 'completed',
                paidAt: new Date(),
                stripe_session_id: session.id
            }
        );
        
        // Get payment details to find subscription
        const payment = await Payment.findOne({ transactionId: session.payment_intent });
        if (payment) {
            // Activate subscription
            await Subscription.findByIdAndUpdate(payment.subscription_id, {
                status: 'active',
                is_active: true
            });
            
            console.log(`Subscription activated for user ${payment.user}`);
        }
        
    } catch (error) {
        console.error('Error handling payment success:', error);
    }
}

// Handle recurring payment success
async function handleRecurringPaymentSuccess(invoice) {
    try {
        console.log('Recurring payment succeeded:', invoice.id);
        
        // Find subscription by Stripe customer ID
        const subscription = await Subscription.findOne({ 
            stripe_customer_id: invoice.customer 
        });
        
        if (subscription) {
            // Extend subscription
            const plan = await Plan.findById(subscription.plan);
            const newEndDate = new Date(subscription.endDate.getTime() + plan.duration * 24 * 60 * 60 * 1000);
            
            await Subscription.findByIdAndUpdate(subscription._id, {
                endDate: newEndDate,
                status: 'active',
                is_active: true
            });
            
            // Create payment record
            await Payment.create({
                user: subscription.user,
                plan: subscription.plan,
                amount: invoice.amount_paid / 100, // Convert from cents
                payment_gateway: 'stripe',
                payment_status: 'completed',
                transactionId: invoice.payment_intent,
                payment_date: new Date(),
                purpose: 'recurring_subscription',
                subscription_id: subscription._id,
                paidAt: new Date(),
                stripe_invoice_id: invoice.id
            });
            
            console.log(`Subscription extended for user ${subscription.user}`);
        }
        
    } catch (error) {
        console.error('Error handling recurring payment:', error);
    }
}

// Handle payment failure
async function handlePaymentFailed(invoice) {
    try {
        console.log('Payment failed:', invoice.id);
        
        // Update payment record
        if (invoice.payment_intent) {
            await Payment.findOneAndUpdate(
                { transactionId: invoice.payment_intent },
                {
                    payment_status: 'failed',
                    failure_reason: invoice.last_payment_failure?.message || 'Payment failed'
                }
            );
        }
        
        // Find and update subscription
        const subscription = await Subscription.findOne({ 
            stripe_customer_id: invoice.customer 
        });
        
        if (subscription) {
            await Subscription.findByIdAndUpdate(subscription._id, {
                status: 'payment_failed',
                is_active: false
            });
            
            console.log(`Subscription payment failed for user ${subscription.user}`);
        }
        
    } catch (error) {
        console.error('Error handling payment failure:', error);
    }
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(stripeSubscription) {
    try {
        console.log('Subscription cancelled:', stripeSubscription.id);
        
        // Find subscription by Stripe subscription ID
        const subscription = await Subscription.findOne({ 
            stripe_subscription_id: stripeSubscription.id 
        });
        
        if (subscription) {
            await Subscription.findByIdAndUpdate(subscription._id, {
                status: 'cancelled',
                is_active: false,
                endDate: new Date(stripeSubscription.ended_at * 1000)
            });
            
            console.log(`Subscription cancelled for user ${subscription.user}`);
        }
        
    } catch (error) {
        console.error('Error handling subscription cancellation:', error);
    }
}

// Handle payment intent failure
async function handlePaymentIntentFailed(paymentIntent) {
    try {
        console.log('Payment intent failed:', paymentIntent.id);
        
        // Update payment record
        await Payment.findOneAndUpdate(
            { transactionId: paymentIntent.id },
            {
                payment_status: 'failed',
                failure_reason: paymentIntent.last_payment_error?.message || 'Payment failed'
            }
        );
        
    } catch (error) {
        console.error('Error handling payment intent failure:', error);
    }
}
