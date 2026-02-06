import Stripe from 'stripe';

// Check if STRIPE_SECRET_KEY is available
if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not defined in environment variables');
    console.error('Please check your .env file');
    process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default stripe;