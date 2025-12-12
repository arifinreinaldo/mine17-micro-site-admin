# Stripe Payment Integration - Implementation Guide

## Overview

Stripe integration has been prepared for the Mine17 application. This guide covers all setup steps and how to integrate the payment functionality into your application.

## What's Been Created

### Core Files

1. **`src/lib/stripe.ts`** - Client-side Stripe configuration
2. **`src/lib/stripe-server.ts`** - Server-side Stripe instance
3. **`src/types/stripe.ts`** - TypeScript interfaces for Stripe operations

### Component Examples

Located in `src/assets/`:

1. **`PricingCard.tsx`** - Upgrade button component
2. **`SubscriptionManagement.tsx`** - Cancel subscription component

### Documentation

- **`STRIPE_SETUP.md`** - Complete setup instructions

## Quick Start

### 1. Install Dependencies

```bash
npm install stripe @stripe/react-stripe-js @stripe/stripe-js
```

### 2. Get Stripe Credentials

1. Go to https://dashboard.stripe.com
2. Get your Publishable Key (pk_test_...)
3. Get your Secret Key (sk_test_...)
4. Create a product and copy Price ID (price_...)

### 3. Add Environment Variables

Create/update `.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-secret
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_your-id
```

### 4. Create API Routes

Create these files in `src/app/api/`:

**`stripe/route.ts`** - Checkout session creation:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { account } from '@/lib/appwrite';

export async function POST(req: NextRequest) {
  try {
    const { priceId, planName } = await req.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    const session = await account.getSession('current');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await account.get();

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.nextUrl.origin}/dashboard/pets?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/dashboard/pets`,
      client_reference_id: user.$id,
      customer_email: user.email,
      metadata: {
        userId: user.$id,
        planName: planName || 'pro',
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

**`stripe-webhook/route.ts`** - Webhook handler:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  const userId = session.client_reference_id;
  const planName = session.metadata?.planName || 'pro';
  console.log(`Checkout completed for user ${userId}: ${planName}`);
  
  // TODO: Update user membership in Appwrite
  // TODO: Store Stripe subscription ID
}

async function handleSubscriptionUpdated(subscription: any) {
  const userId = subscription.metadata?.userId;
  console.log(`Subscription updated for user ${userId}`);
}

async function handleSubscriptionDeleted(subscription: any) {
  const userId = subscription.metadata?.userId;
  console.log(`Subscription deleted for user ${userId}`);
  
  // TODO: Downgrade user to free tier
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  console.log(`Invoice payment succeeded: ${invoice.id}`);
}

async function handleInvoicePaymentFailed(invoice: any) {
  console.log(`Invoice payment failed: ${invoice.id}`);
  
  // TODO: Notify user of payment failure
}
```

**`cancel-subscription/route.ts`** - Cancel subscription:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { account } from '@/lib/appwrite';

export async function POST(req: NextRequest) {
  try {
    const session = await account.getSession('current');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await account.get();

    const subscriptions = await stripe.subscriptions.list({
      customer: user.$id,
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    const subscription = subscriptions.data[0];

    const canceledSubscription = await stripe.subscriptions.update(
      subscription.id,
      { cancel_at_period_end: true }
    );

    return NextResponse.json({
      message: 'Subscription will be cancelled at the end of the billing period',
      subscription: canceledSubscription,
    });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
```

### 5. Create Pricing Page

Create `src/app/dashboard/pricing/page.tsx`:

```typescript
'use client';

import { useAuth } from '@/context/AuthContext';
import PricingCard from '@/assets/PricingCard';
import SubscriptionManagement from '@/assets/SubscriptionManagement';

export default function PricingPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Pricing Plans</h1>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Free Plan */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Plan</h3>
            <p className="text-gray-600 mb-4">Perfect for getting started</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-gray-600 ml-2">/month</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center text-gray-700">
                <svg
                  className="w-5 h-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                1 Pet
              </li>
              <li className="flex items-center text-gray-700">
                <svg
                  className="w-5 h-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Basic Features
              </li>
              <li className="flex items-center text-gray-700">
                <svg
                  className="w-5 h-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                QR Code Generation
              </li>
            </ul>
            <button
              disabled
              className="w-full py-2 px-4 bg-gray-300 text-gray-700 font-semibold rounded-lg cursor-not-allowed"
            >
              Current Plan
            </button>
          </div>

          {/* Pro Plan */}
          <PricingCard />
        </div>

        {/* Subscription Management */}
        <div className="max-w-2xl mx-auto">
          <SubscriptionManagement />
        </div>
      </div>
    </div>
  );
}
```

### 6. Update Navigation

Add pricing link to `src/app/dashboard/layout.tsx`:

```typescript
<Link
  href="/dashboard/pricing"
  className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
>
  Pricing
</Link>
```

### 7. Setup Stripe Webhook

1. In Stripe Dashboard, go to Webhooks
2. Click "Add endpoint"
3. URL: `https://your-domain.com/api/stripe-webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy signing secret and add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

## Key Considerations

### User Preferences Integration

The webhook handlers need to update user membership. Add this to AuthContext:

```typescript
// Update membership when subscription succeeds
const updateMembership = async (userId: string, status: 'free' | 'pro') => {
  const user = await account.get();
  await account.updatePrefs({
    ...user.prefs,
    membership: status,
  });
};
```

### Stripe Customer ID Storage

Store Stripe customer ID in user preferences:

```typescript
await account.updatePrefs({
  ...currentPrefs,
  stripeCustomerId: customerId,
});
```

### Testing

Use these test cards in test mode:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Auth Required**: 4000 0025 0000 3155

Any future date and CVC works in test mode.

Test webhook locally with Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
stripe trigger checkout.session.completed
```

## Implementation Checklist

- [ ] Install Stripe packages
- [ ] Add environment variables
- [ ] Create API routes (stripe, stripe-webhook, cancel-subscription)
- [ ] Create pricing page
- [ ] Add Stripe webhook endpoint
- [ ] Update AuthContext with membership logic
- [ ] Add navigation links
- [ ] Test with Stripe test cards
- [ ] Test webhook delivery
- [ ] Deploy to production
- [ ] Switch to live keys (pk_live_... and sk_live_...)

## Troubleshooting

### Webhook not being called

1. Check webhook endpoint URL in Stripe Dashboard
2. Verify `STRIPE_WEBHOOK_SECRET` is correct
3. Check application logs for errors
4. Use Stripe CLI to test webhook delivery

### Payment failing

1. Check Stripe API key is correct
2. Verify price ID exists in Stripe Dashboard
3. Check user authentication
4. Review error message in response

### Subscription not updating

1. Verify webhook handler is being called
2. Check membership update logic
3. Ensure user preferences can be updated
4. Check Appwrite permissions

## Files Summary

```
src/
├── lib/
│   ├── stripe.ts              ✅ Created
│   └── stripe-server.ts       ✅ Created
├── types/
│   └── stripe.ts              ✅ Created
├── assets/
│   ├── PricingCard.tsx        ✅ Created
│   └── SubscriptionManagement.tsx ✅ Created
└── app/
    ├── api/
    │   ├── stripe/route.ts                 ⚠️ Needs creation
    │   ├── stripe-webhook/route.ts         ⚠️ Needs creation
    │   └── cancel-subscription/route.ts    ⚠️ Needs creation
    └── dashboard/
        └── pricing/page.tsx                ⚠️ Needs creation
```

✅ = Created
⚠️ = Needs creation

## Next Steps

1. Create the missing API route files
2. Create the pricing page
3. Setup Stripe webhook
4. Test payment flow
5. Implement membership update logic in webhook handlers
