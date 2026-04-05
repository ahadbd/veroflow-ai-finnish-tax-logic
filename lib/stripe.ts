import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set in environment variables. Using placeholder for build.');
}

export const stripe = new Stripe(apiKey, {
  apiVersion: '2025-01-27-acacia',
  typescript: true,
});
