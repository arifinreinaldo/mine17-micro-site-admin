# Stripe Payment Integration Setup

This document provides instructions for setting up Stripe payments in the Mine17 Admin application.

## Installation

First, install the required Stripe packages:

```bash
npm install stripe @stripe/react-stripe-js @stripe/stripe-js
```

## Environment Variables

Add the following to your `.env.local` file:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_your-pro-plan-id
```

## Files Created

The following files have been created as the foundation for Stripe integration:

### Utility Files

1. **`src/lib/stripe.ts`** - Client-side Stripe configuration
   - Loads Stripe.js
   - Defines pricing plans
   - Exports stripe promise for components

2. **`src/lib/stripe-server.ts`** - Server-side Stripe instance
   - Initializes Stripe SDK with secret key
   - Used in API routes for payments and webhooks

### API Routes to Create

You need to create these files in `src/app/api/`:

1. **`stripe/route.ts`** - Create checkout session
   ```
   POST /api/stripe
   Body: { priceId: string, planName?: string }
   Returns: { sessionId: string }
   ```

2. **`stripe-webhook/route.ts`** - Stripe webhook handler
   ```
   POST /api/stripe-webhook
   Handles: checkout.session.completed, subscription events, invoices
   ```

3. **`cancel-subscription/route.ts`** - Cancel user subscription
   ```
   POST /api/cancel-subscription
   Returns: { message: string, subscription: object }
   ```

## Directory Structure

Create the following directory structure:

```
src/
├── app/
│   ├── api/
│   │   ├── stripe/
│   │   │   └── route.ts
│   │   ├── stripe-webhook/
│   │   │   └── route.ts
│   │   └── cancel-subscription/
│   │       └── route.ts
│   └── dashboard/
│       └── pricing/
│           └── page.tsx (new)
└── lib/
    ├── stripe.ts
    └── stripe-server.ts
```

## Component Structure for Future Implementation

### Pricing Page Component

The pricing page should be created at `src/app/dashboard/pricing/page.tsx` with:

```typescript
'use client';

import { loadStripe } from '@stripe/stripe-js';
import { stripePromise, PRICING_PLANS } from '@/lib/stripe';
import { useAuth } from '@/context/AuthContext';

export default function PricingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (priceId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, planName: 'pro' }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Pricing plan cards with upgrade buttons
  );
}
```

### Payment Modal Component

Create `src/components/PaymentModal.tsx` for payment UI:

```typescript
'use client';

import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import CheckoutForm from './CheckoutForm';

export default function PaymentModal({ priceId, onClose }: Props) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm priceId={priceId} onClose={onClose} />
    </Elements>
  );
}
```

## Setup Instructions

### 1. Get Stripe Keys

1. Go to https://dashboard.stripe.com
2. Sign in or create an account
3. Go to Developers → API Keys
4. Copy your Publishable Key (starts with `pk_`)
5. Copy your Secret Key (starts with `sk_`)
6. Add both to `.env.local`

### 2. Create Price in Stripe Dashboard

1. Go to Products → Create product
2. Set name: "Pro Plan"
3. Set price: $9.99/month
4. Copy the Price ID (starts with `price_`)
5. Add to `.env.local` as `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`

### 3. Set Up Webhook

1. Go to Webhooks in Stripe Dashboard
2. Click "Add endpoint"
3. URL: `https://your-domain.com/api/stripe-webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy Signing Secret (starts with `whsec_`)
6. Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

### 4. Connect Appwrite to Stripe

To complete the integration, you need to:

1. Store Stripe Customer ID in user preferences:
   ```typescript
   await account.updatePrefs({
     ...currentPrefs,
     stripeCustomerId: customerId,
   });
   ```

2. Update membership status when payment succeeds:
   ```typescript
   await account.updatePrefs({
     ...currentPrefs,
     membership: 'pro',
     subscriptionId: subscription.id,
   });
   ```

3. Downgrade membership when subscription is cancelled:
   ```typescript
   await account.updatePrefs({
     ...currentPrefs,
     membership: 'free',
   });
   ```

## Testing

### Test Mode

Use these test card numbers with Stripe in test mode:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Auth**: 4000 0025 0000 3155

Any future date and any 3-digit CVC works in test mode.

### Test Webhook Locally

Use Stripe CLI to test webhooks:

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe-webhook

# In another terminal, trigger test events
stripe trigger checkout.session.completed
```

## Next Steps

1. Install packages: `npm install stripe @stripe/react-stripe-js @stripe/stripe-js`
2. Create directories and route files as specified above
3. Add environment variables to `.env.local`
4. Create Stripe product and get keys
5. Configure webhook endpoint
6. Implement pricing page
7. Add upgrade button to dashboard
8. Update membership status in AuthContext when payment succeeds
9. Test with Stripe test cards

## API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/stripe` | POST | Create checkout session |
| `/api/stripe-webhook` | POST | Handle Stripe events |
| `/api/cancel-subscription` | POST | Cancel active subscription |

## Important Notes

- All payment operations require authentication
- Webhook handler should not expose internal errors
- Store Stripe Customer ID to enable subscriptions
- Implement proper error handling and user feedback
- Use secure environment variables for secrets
- Test webhook integration before going live
- Implement idempotency to prevent duplicate charges
