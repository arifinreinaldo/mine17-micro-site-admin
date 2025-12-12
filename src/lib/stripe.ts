import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

export const PRICING_PLANS = {
  pro: {
    name: 'Pro Plan',
    description: 'Unlimited pets and features',
    price: 9.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '',
    features: [
      'Unlimited pets',
      'Advanced analytics',
      'Priority support',
      'Custom QR codes',
    ],
  },
} as const;
