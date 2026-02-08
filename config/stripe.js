import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

//Check if STRIPE_SECRET_KEY is available
if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not defined in environment variables');
    console.error('Please check your .env file');
    console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('STRIPE')));
    console.error('All env vars starting with S:', Object.keys(process.env).filter(key => key.startsWith('s')));
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

export {stripe};